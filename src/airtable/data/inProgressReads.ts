import type { AirtableBase, RecordBase } from "../types";
import { loadBooks, type Book } from "./books";
import { loadListedRecords } from "./common";
import { type ReadMedium } from "./reads";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwCifli1mloUoAD8",
  tableName: "Reads",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    dateStarted: "fldpTeBoUi700VdNH",
    medium: "fld00LRZuJkDXWMsg",
    book: "fldxbKcjUeeQG1e8G",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.medium]: ReadMedium;
  [fields.book]: [string];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type ReadRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  dateStarted: string;
  medium: ReadMedium;
};
type ForeignKeyFields = {
  book: Book;
};
export type InProgressRead = LocalFields & ForeignKeyFields;

const materialize = (readRow: ReadRecord): LocalFields => ({
  dateStarted: readRow[fields.dateStarted],
  medium: readRow[fields.medium],
});

export const loadInProgressReads = async (): Promise<InProgressRead[]> =>
  await loadListedRecords(SCHEMA, materialize, [
    {
      key: "book",
      foreignItems: await loadBooks(),
      keyGrabber: (readRow) => readRow[fields.book],
    },
  ]);
