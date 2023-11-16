import slugify from "@sindresorhus/slugify";
import { type Base } from "../types";
import { loadReferenceRecords } from "./common";

export const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwst3tJ6W0nlO8tm",
  tableName: "Authors",
  fields: {
    name: "fldKxzwvf9blINIWw",
  },
} as const satisfies Base;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  recordId: string;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

type AuthorRecord = StringFields & NonStringFields;

export type MaterializedAuthor = {
  name: string;
  recordId: string;
  slug: string;
};

const materializeAuthor = (
  authorRow: AuthorRecord & { recordId: string },
): MaterializedAuthor => ({
  name: authorRow[fields.name],
  slug: slugify(authorRow[fields.name]),
  recordId: authorRow.recordId,
});

export const loadMaterializedAuthors = () =>
  loadReferenceRecords<AuthorRecord, MaterializedAuthor, never>(
    SCHEMA,
    materializeAuthor,
  );
