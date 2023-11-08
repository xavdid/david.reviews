import Airtable from "airtable";

const isProdBuild = import.meta.env.MODE === "production";
// while developing, limit records to a single page to speed up iteration
export const NUM_RECORDS = isProdBuild ? undefined : 100;

export const client = new Airtable({
  apiKey: import.meta.env.AIRTABLE_API_KEY,
});

export type Base = {
  baseId: string;
  viewId: string;
  fields: { [fieldName: string]: string };
};
