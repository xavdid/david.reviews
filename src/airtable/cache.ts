import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Base } from "./types";

const buildCachePath = (table: string) =>
  new URL(`./_cache/${table}.json`, import.meta.url);

export const readCache = async <T>({ tableName }: Base): Promise<T | null> => {
  try {
    const data = await readFile(buildCachePath(tableName), "utf-8");
    return JSON.parse(data) as T;
  } catch (e: any) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    return null;
  }
};
export const writeCache = async (
  { tableName }: Base,
  data: any,
): Promise<void> => {
  const cachePath = buildCachePath(tableName);

  // write fails if the subfolder doesn't exist
  await mkdir(dirname(cachePath.pathname), { recursive: true });

  return writeFile(buildCachePath(tableName), JSON.stringify(data), {
    encoding: "utf-8",
  });
};
