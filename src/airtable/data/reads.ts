import type { AwardTier, Base } from "../types";
import { loadMaterializedBooks, type MaterializedBook } from "./books";
import { loadAllRecords, loadListedRecords } from "./common";

export const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwqz5EPsfegbEmCP",
  tableName: "Reads",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    // title: "fldGhXwfauEvXCOxU", // TODO: remove
    // googleBooksId: "fldFQOw6UZDeMwsf4", // TODO: remove
    rating: "fldcYBkA0w9G49ZRr",
    notes: "fldt0Xy3ncrVOxGAI",
    dateFinished: "fldqmKpPjPt6VNgAn",
    isReread: "fldp6jjlmJ5BP7P6w",
    medium: "fld00LRZuJkDXWMsg",
    // seriesName: "fldeG50NjS7IZFsQb", // remove
    // numberInSeries: "fldSdUIsg9exyh8BM",
    book: "fldxbKcjUeeQG1e8G",
    // authorLastNames: "fld7vlWOOWSpAWk1q", // remove
    // authorFullNames: "fldp5tglohwONaZqE", // remove
    // authorIds: "fld6Iuw1UwF0gCR5m", // remove
  },
} as const satisfies Base;

const fields = SCHEMA.fields;

export type BookMedium = "Paper" | "Digital" | "Audio";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  // [fields.title]: [string];
  [fields.rating]: number;
  [fields.isReread]: boolean;
  [fields.medium]: BookMedium;
  [fields.book]: [string];
  // [fields.awardTier]?: [AwardTier];
  // [fields.awardYear]?: [number];
  // [fields.awardAnchor]?: [string];
  // [fields.googleBooksId]?: [string];
  // [fields.seriesName]?: [string];
  // [fields.numberInSeries]?: [number];
  // [fields.authorLastNames]: string[];
  // [fields.authorIds]: string[];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

export type ReadRecord = StringFields & NonStringFields;

type LocalFields = {
  rating: number;
  notes: string;
  dateFinished: string;
  isReread: boolean;
  medium: BookMedium;
  // numberInSeries?: number;
};
type ForeignKeyFields = {
  book: MaterializedBook;
};

export type MaterializedRead = LocalFields & ForeignKeyFields;

const materializer = (readRow: ReadRecord): LocalFields => ({
  rating: readRow[fields.rating],
  notes: readRow[fields.notes],
  dateFinished: readRow[fields.dateFinished],
  isReread: readRow[fields.isReread],
  medium: readRow[fields.medium],
});

export const loadMaterializedReads = async (): Promise<MaterializedRead[]> =>
  loadListedRecords(SCHEMA, materializer, [
    {
      key: "book",
      foreignItems: await loadMaterializedBooks(),
      keyGrabber: (readRow) => readRow[fields.book],
    },
  ]);
