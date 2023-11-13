import Airtable from "airtable";
import { readFile, writeFile } from "node:fs/promises";

export const isProdBuild = import.meta.env.MODE === "production";

export const client = new Airtable({
  apiKey: import.meta.env.AIRTABLE_API_KEY,
});

export type Base = {
  baseId: string;
  tableName: string;
  viewId: string;
  fields: { [fieldName: string]: string };
};
export type AwardTier = "Gold" | "Silver" | "Bronze";
export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: string;
};

export const medals: { [x in AwardTier]: string } = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
} as const;

export const loadAllRecords = async <T>(
  { baseId, tableName, fields, viewId }: Base,
  { loadAll = false }: { loadAll?: boolean } = {},
): Promise<Array<{ recordId: string } & T>> => {
  const cache = await readCache<{ recordId: string } & T>(tableName);
  if (cache) {
    return cache;
  }

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

  const result = rawRecords.map((record) => ({
    recordId: record.id,
    ...record.fields,
  })) as ({ recordId: string } & T)[];

  writeCache(tableName, result);
  return result;
};

const cachePath = (table: string) =>
  new URL(`./_cache/${table}.json`, import.meta.url);

export const readCache = async <T>(table: string): Promise<T[] | null> => {
  try {
    const data = await readFile(cachePath(table), "utf-8");
    return JSON.parse(data) as T[];
  } catch (e: any) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    return null;
  }
};
export const writeCache = async (table: string, data: any): Promise<void> => {
  return writeFile(cachePath(table), JSON.stringify(data), {
    encoding: "utf-8",
  });
};
