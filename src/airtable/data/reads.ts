import type { AirtableBase, RecordBase } from "../types";
import { loadBooks, type Book } from "./books";
import { loadListedRecords } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwaBGtdx8nc8I1Kp",
  tableName: "Reads",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    rating: "fldcYBkA0w9G49ZRr",
    notes: "fldt0Xy3ncrVOxGAI",
    dateFinished: "fldqmKpPjPt6VNgAn",
    isReread: "fldp6jjlmJ5BP7P6w",
    medium: "fld00LRZuJkDXWMsg",
    book: "fldxbKcjUeeQG1e8G",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type ReadMedium = "Paper" | "Digital" | "Audio";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.isReread]: boolean;
  [fields.medium]: ReadMedium;
  [fields.book]: [string];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type ReadRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  rating: number;
  notes: string;
  dateFinished: string;
  isReread: boolean;
  medium: ReadMedium;
};
type ForeignKeyFields = {
  book: Book;
};
export type Read = LocalFields & ForeignKeyFields;

const materialize = (readRow: ReadRecord): LocalFields => ({
  rating: readRow[fields.rating],
  notes: readRow[fields.notes],
  dateFinished: readRow[fields.dateFinished],
  isReread: readRow[fields.isReread],
  medium: readRow[fields.medium],
});

export const loadReads = async (): Promise<Read[]> =>
  await loadListedRecords(SCHEMA, materialize, [
    {
      key: "book",
      foreignItems: await loadBooks(),
      keyGrabber: (readRow) => readRow[fields.book],
    },
  ]);
