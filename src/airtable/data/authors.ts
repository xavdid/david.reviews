import slugify from "@sindresorhus/slugify";

import { type Base, type RecordBase } from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
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
  // manually defined, but not requested from Airtable
  recordId: string;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type AuthorRecord = StringFields & NonStringFields & RecordBase;

export type Author = {
  name: string;
  recordId: string;
  slug: string;
};

const materialize = (authorRow: AuthorRecord): Author => ({
  name: authorRow[fields.name],
  slug: slugify(authorRow[fields.name]),
  recordId: authorRow.recordId,
});

export const loadAuthors = () =>
  loadReferenceRecords<AuthorRecord, Author, never>(SCHEMA, materialize);
