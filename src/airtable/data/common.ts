import Airtable from "airtable";
import { readCache, writeCache } from "../cache";
import type { AirtableBase, AwardTier } from "../types";

export const isProdBuild = import.meta.env.MODE === "production";

export const medals: { [x in AwardTier]: string } = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
} as const;

const client = new Airtable({
  apiKey: import.meta.env.AIRTABLE_API_KEY as string,
});

const loadAllRecords = async <T>(
  { baseId, tableName, fields, viewId }: AirtableBase,
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
  })) as Array<{ recordId: string } & T>;
};

/**
 * used to load and materialize support records, like Movies or Books, which are referenced by the main tables (Watches, Reads, etc).
 *
 * It caches the materialized result.
 */
export const loadReferenceRecords = async <
  RecordType,
  MaterializedType,
  ForeignKeys extends keyof MaterializedType,
>(
  schema: AirtableBase,
  materializer: (row: RecordType) => Omit<MaterializedType, ForeignKeys>,
  foreignKeyRelationships?: Array<{
    key: ForeignKeys;
    foreignItems: Record<string, MaterializedType[ForeignKeys]>;
    keyGrabber: (row: RecordType) => string[] | undefined;
    condense?: boolean;
  }>,
): Promise<Record<string, MaterializedType>> => {
  const data = await readCache<Record<string, MaterializedType>>(schema);
  if (data) {
    return data;
  }

  const records = await loadAllRecords<RecordType>(schema, {
    loadAll: true,
  });

  const materializedById = records.reduce<Record<string, MaterializedType>>(
    (result, record) => {
      const item = materializer(record);
      for (const {
        key,
        foreignItems,
        keyGrabber,
        condense,
      } of foreignKeyRelationships ?? []) {
        const fkIds = keyGrabber(record);
        if (fkIds) {
          // @ts-expect-error - I can index this with foreign keys
          item[key] = materializeRecordIds(fkIds, foreignItems, key, condense);
        }
      }

      // @ts-expect-error - these are related types!
      result[record.recordId] = item;
      return result;
    },
    {},
  );

  await writeCache(schema, materializedById);
  return materializedById;
};

/**
 * given a list of record ids and a big reference map, replace the ids with actual object
 */
const materializeRecordIds = <T>(
  foreignKeys: string[],
  foreignObjects: Record<string, T>,
  foreignObjectType: string,
  condense = true,
): T | T[] => {
  const result = foreignKeys.map((fk) => {
    const record = foreignObjects[fk] as T | undefined;
    if (record === undefined) {
      throw new Error(
        `Failed to materialize ${foreignObjectType} record for ${fk}`,
      );
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
 * Loads all records with foreign keys. Actually respects size limits.
 * this is a little more complicated than I like, but it _does_ validate foreign keys correctly, which is cool
 */
export const loadListedRecords = async <
  RecordType,
  MaterializedType,
  ForeignKeys extends keyof MaterializedType,
>(
  schema: AirtableBase,
  materializer: (row: RecordType) => Omit<MaterializedType, ForeignKeys>,
  foreignKeyRelationships: Array<{
    key: ForeignKeys;
    foreignItems: Record<string, MaterializedType[ForeignKeys]>;
    keyGrabber: (row: RecordType) => string[];
    condense?: boolean;
  }>,
): Promise<MaterializedType[]> => {
  const data = await readCache<MaterializedType[]>(schema);
  if (data) {
    return data;
  }

  const records = await loadAllRecords<RecordType>(schema);

  const result = records.map((record) => {
    const item = materializer(record);

    for (const {
      key,
      foreignItems,
      keyGrabber,
      condense,
    } of foreignKeyRelationships) {
      const fkIds = keyGrabber(record);
      if (fkIds.length) {
        // @ts-expect-error - I can index this with foreign keys
        item[key] = materializeRecordIds(fkIds, foreignItems, key, condense);
      }
    }
    return item;
  }) as MaterializedType[];

  await writeCache(schema, result);
  return result;
};
