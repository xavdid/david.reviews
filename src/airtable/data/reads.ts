import type { AirtableBase, RecordBase } from "../types";
import { loadBooks, type Book } from "./books";
import { loadListedObjects } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwaBGtdx8nc8I1Kp",
  tableName: "Reads",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    recordId: "fld75nxeBObGy25Qc",
    rating: "fldcYBkA0w9G49ZRr",
    notes: "fldt0Xy3ncrVOxGAI",
    dateFinished: "fldqmKpPjPt6VNgAn",
    isReread: "fldp6jjlmJ5BP7P6w",
    medium: "fld00LRZuJkDXWMsg",
    book: "fldxbKcjUeeQG1e8G",
    shouldAutoPost: "fldeMudyBqnwurhiI",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

export type ReadMedium = "Paper" | "Digital" | "Audio";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.isReread]?: true;
  [fields.medium]: ReadMedium;
  [fields.book]: [string];
  [fields.shouldAutoPost]?: true;
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
  recordId: string;
  shouldAutoPost: boolean;
  category: "book";
};
type ForeignKeyFields = {
  book: Book;
};
export type Read = LocalFields & ForeignKeyFields;

const materialize = (readRow: ReadRecord): LocalFields => ({
  rating: readRow[fields.rating],
  notes: readRow[fields.notes] ?? "",
  dateFinished: readRow[fields.dateFinished],
  isReread: Boolean(readRow[fields.isReread]),
  medium: readRow[fields.medium],
  recordId: readRow[fields.recordId],
  shouldAutoPost: Boolean(readRow[fields.shouldAutoPost]),
  category: "book",
});

export const loadReads = async (): Promise<Read[]> =>
  await loadListedObjects(SCHEMA, materialize, [
    {
      key: "book",
      foreignItems: await loadBooks(),
      keyGrabber: (readRow) => readRow[fields.book],
    },
  ]);
