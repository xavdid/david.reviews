import slugify from "@sindresorhus/slugify";

import { type AirtableBase, type Permalink, type RecordBase } from "../types";
import { loadReferenceObjects } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwTO8dOPtZBndX34",
  tableName: "Authors",
  fields: {
    fullName: "fldKxzwvf9blINIWw",
    lastName: "flduQlOUeqoUhO4FW",
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
  // for an unknown reason, it's important that both `Author` and `Series` have a `name` key.
  // They don't need to agree on every key, but if this is renamed to `fullName`, TS complains (in `loadBooks`)
  name: string;
  lastName: string;
  recordId: string;
  slug: string;
  permalink: Permalink;
};

const materialize = (authorRow: AuthorRecord): Author => {
  const slug = slugify(authorRow[fields.fullName]);
  return {
    name: authorRow[fields.fullName],
    lastName: authorRow[fields.lastName],
    slug,
    permalink: `/books/authors/${slug}/`,
    recordId: authorRow.recordId,
  };
};

export const loadAuthors = async (): Promise<Record<string, Author>> =>
  await loadReferenceObjects<AuthorRecord, Author, never>(SCHEMA, materialize);
