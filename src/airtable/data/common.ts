import Airtable from "airtable";
import { isProdBuild } from "../../utils/data";
import { readCache, writeCache } from "../cache";
import type { AirtableBase } from "../types";

const client = new Airtable({
  apiKey: import.meta.env.AIRTABLE_API_KEY as string,
});

const loadRecords = async <T>(
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
 * It caches the materialized result.
 * @param schema The full schema which defines fields and their relationships / types
 * @param materializer a function that takes an Airtable row and returns an object with all of a record's local fields (in the correct type)
 * @param foreignKeyRelationships a list of objects that describe foreign keys. It needs:
 *   - `key`: the name of the key on `schema` that's an FK relationship
 *   - `foreignItems`: the full table of items that this type has a relationship with. Map of rowId -> item
 *   - `keyGrabber`: a function that gets the list of foreign keys on a record. It mostly just does a lookup with local field ids.
 *   - `condense?`: if a row will only ever have 0 or 1 foreign items, `condense` ensures we get a singleton instead of an array. Useful for catching duplicates where there shouldn't be, since it errors if it tries to condense 2+ items (e.g. a book is linked to 2 series when it shouldn't be).
 * @returns
 */
export const loadReferenceObjects = async <
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

  const records = await loadRecords<RecordType>(schema, {
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
        `Failed to materialize record ${fk} (of type "${foreignObjectType}")`,
      );
    }
    return record;
  });

  if (condense && result.length > 1) {
    throw new Error(
      `tried to condense list ${JSON.stringify(
        result,
      )} that had more than one item; a record probably has duplicate links.`,
    );
  }

  return condense ? result[0] : result;
};

/**
 * Loads all records with foreign keys. Actually respects size limits.
 * this is a little more complicated than I like, but it _does_ validate foreign keys correctly, which is cool
 */
export const loadListedObjects = async <
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

  const records = await loadRecords<RecordType>(schema);

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
