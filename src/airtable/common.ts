import Airtable from "airtable";

const isProdBuild = import.meta.env.MODE === "production";
// while developing, limit records to a single page to speed up iteration
export const NUM_RECORDS = isProdBuild ? undefined : 100;

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

export const medals: { [x in AwardTier]: string } = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
} as const;

export const loadAllRecords = async <T>({
  baseId,
  tableName,
  fields,
  viewId,
}: Base): Promise<Array<{ recordId: string } & T>> => {
  const rawRecords = await client
    .base(baseId)
    .table(tableName)
    .select({
      ...{
        view: viewId,
        fields: [...Object.values(fields)],
        returnFieldsByFieldId: true,
      },
      // maxRecords can't be undefined, has to be number or missing entirely
      ...(NUM_RECORDS ? { maxRecords: NUM_RECORDS } : {}),
    })
    .all();

  return rawRecords.map((record) => ({
    recordId: record.id,
    ...record.fields,
  })) as ({ recordId: string } & T)[];
};
