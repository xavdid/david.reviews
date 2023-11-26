import slugify from "@sindresorhus/slugify";

import { type AirtableBase, type Permalink, type RecordBase } from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwTO8dOPtZBndX34",
  tableName: "Authors",
  fields: {
    name: "fldKxzwvf9blINIWw",
  },
} as const satisfies AirtableBase;
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
  permalink: Permalink;
};

const materialize = (authorRow: AuthorRecord): Author => {
  const slug = slugify(authorRow[fields.name]);
  return {
    name: authorRow[fields.name],
    slug,
    permalink: `/books/authors/${slug}/`,
    recordId: authorRow.recordId,
  };
};

export const loadAuthors = async (): Promise<Record<string, Author>> =>
  await loadReferenceRecords<AuthorRecord, Author, never>(SCHEMA, materialize);
