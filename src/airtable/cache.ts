import { readFile, writeFile } from "node:fs/promises";
import type { Base } from "./types";

const cachePath = (table: string) =>
  new URL(`./_cache/${table}.json`, import.meta.url);

export const readCache = async <T>({ tableName }: Base): Promise<T | null> => {
  try {
    const data = await readFile(cachePath(tableName), "utf-8");
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
  return writeFile(cachePath(tableName), JSON.stringify(data), {
    encoding: "utf-8",
  });
};
