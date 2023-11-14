import type { AwardTier, Base } from "../types";
import { loadAllRecords } from "./common";

export const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwqz5EPsfegbEmCP",
  tableName: "Reads",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    title: "fldGhXwfauEvXCOxU",
    googleBooksId: "fldFQOw6UZDeMwsf4",
    rating: "fldcYBkA0w9G49ZRr",
    notes: "fldt0Xy3ncrVOxGAI",
    dateFinished: "fldqmKpPjPt6VNgAn",
    isReread: "fldp6jjlmJ5BP7P6w",
    medium: "fld00LRZuJkDXWMsg",
    awardTier: "fldGVg6aMvxsNs8py",
    awardYear: "fldnS7UjNj1HdPNjY",
    awardAnchor: "fldHv829lvw6hXsyD",
    seriesName: "fldeG50NjS7IZFsQb",
    numberInSeries: "fldSdUIsg9exyh8BM",
    authorLastNames: "fld7vlWOOWSpAWk1q",
    authorFullNames: "fldp5tglohwONaZqE",
    authorIds: "fld6Iuw1UwF0gCR5m",
  },
} as const satisfies Base;

export const fields = SCHEMA.fields;

export type BookMedium = "Paper" | "Digital" | "Audio";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.title]: [string];
  [fields.rating]: number;
  [fields.isReread]: boolean;
  [fields.medium]: BookMedium;
  [fields.awardTier]?: [AwardTier];
  [fields.awardYear]?: [number];
  [fields.awardAnchor]?: [string];
  [fields.googleBooksId]?: [string];
  [fields.seriesName]?: [string];
  [fields.numberInSeries]?: [number];
  [fields.authorLastNames]: string[];
  [fields.authorIds]: string[];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

export type ReadRecord = StringFields & NonStringFields;

export const loadReads = async (): Promise<
  ({ recordId: string } & ReadRecord)[]
> => {
  const readRows = await loadAllRecords<ReadRecord>(SCHEMA);

  // TOOD: writeCache()

  // filter out audible-only things for now
  return readRows.filter((r) => r[fields.googleBooksId]);
};
