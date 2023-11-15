import Airtable from "airtable";
import { readCache, writeCache } from "../cache";
import type { AwardTier, Base } from "../types";

export const isProdBuild = import.meta.env.MODE === "production";

const client = new Airtable({
  apiKey: import.meta.env.AIRTABLE_API_KEY,
});

export const medals: { [x in AwardTier]: string } = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
} as const;

export const loadAllRecords = async <T>(
  { baseId, tableName, fields, viewId }: Base,
  { loadAll = false }: { loadAll?: boolean } = {},
): Promise<Array<{ recordId: string } & T>> => {
  const rawRecords = await client
    .base(baseId)
    .table(tableName)
    .select({
      view: viewId,
      fields: [...Object.values(fields)],
      returnFieldsByFieldId: true,
      // maxRecords can't be undefined, has to be number or missing entirely
      // while developing, limit records to a single page to speed up iteration
      ...(loadAll || isProdBuild ? {} : { maxRecords: 100 }),
    })
    .all();

  return rawRecords.map((record) => ({
    recordId: record.id,
    ...record.fields,
  })) as ({ recordId: string } & T)[];
};

/**
 * used to load and materialize support records, like Movies or Books, which are referenced by the main tables (Watches, Reads, etc).
 *
 * It caches the materialized result.
 */
export const loadAllReferenceRecords = async <RecordType, MaterializedType>(
  schema: Base,
  materializer: (row: RecordType) => MaterializedType,
): Promise<{
  [recordId: string]: MaterializedType;
}> => {
  const data = await readCache<{
    [recordId: string]: MaterializedType;
  }>(schema);
  if (data) {
    return data;
  }

  const rows = await loadAllRecords<RecordType>(schema, {
    loadAll: true,
  });

  const materializedById = rows.reduce<{
    [recordId: string]: MaterializedType;
  }>((result, row) => {
    result[row.recordId] = materializer(row);
    return result;
  }, {});

  writeCache(schema, materializedById);
  return materializedById;
};

const materializeRecordIds = <T>(
  recordIds: string[],
  records: { [recordId: string]: T },
  condense = true,
): T | T[] => {
  const result = recordIds.map((recordId) => {
    const record = records[recordId];
    if (!record) {
      throw new Error(`Failed to materialize record for ${recordId}`);
    }
    return record;
  });

  if (condense && result.length > 1) {
    throw new Error(
      `tried to condense list ${JSON.stringify(
        result,
      )} that had more than one item`,
    );
  }

  return condense ? result[0] : result;
};

/**
 * this is a little more complicated than I like, but it _does_ validate foreign keys correctly, which is cool
 */
export const loadMainRecords = async <
  RecordType,
  MaterializedType,
  ForeignKeys extends keyof MaterializedType,
>(
  schema: Base,
  materializer: (row: RecordType) => Omit<MaterializedType, ForeignKeys>,
  foreignKeys: {
    key: ForeignKeys;
    recordLoader: () => Promise<{
      [recordId: string]: MaterializedType[ForeignKeys];
    }>;
    keyGrabber: (row: RecordType) => string[];
    condense?: boolean;
  }[],
): Promise<MaterializedType[]> => {
  const data = await readCache<MaterializedType[]>(schema);
  if (data) {
    return data;
  }

  const records = await loadAllRecords<RecordType>(schema);

  const result = await Promise.all(
    records.map(async (record): Promise<MaterializedType> => {
      const result = materializer(record);

      for (const { key, recordLoader, keyGrabber, condense } of foreignKeys) {
        // todo: only call `recordLoader()` once

        // @ts-expect-error - I can index this with foreign keys
        result[key] = materializeRecordIds(
          keyGrabber(record),
          await recordLoader(),
          condense,
        );
      }
      // @ts-expect-error - I promise these are related
      return result;
    }),
  );
  writeCache(schema, result);
  return result;
};
