import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AirtableBase } from "./types";

const buildCachePath = (table: string, viewId: string): URL =>
  new URL(`./_cache/${table}-${viewId}.json`, import.meta.url);

export const readCache = async <T>({
  tableName,
  viewId,
}: AirtableBase): Promise<T | null> => {
  try {
    const data = await readFile(buildCachePath(tableName, viewId), "utf-8");
    return JSON.parse(data) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.code !== "ENOENT") {
      throw e;
    }
    return null;
  }
};
export const writeCache = async (
  { tableName, viewId }: AirtableBase,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<void> => {
  const cachePath = buildCachePath(tableName, viewId);

  // write fails if the subfolder doesn't exist
  await mkdir(dirname(cachePath.pathname), { recursive: true });

  await writeFile(cachePath, JSON.stringify(data), {
    encoding: "utf-8",
  });
};
