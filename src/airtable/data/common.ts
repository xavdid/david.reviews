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
