import slugify from "@sindresorhus/slugify";
import type { AirtableBase, Permalink, RecordBase } from "../types";
import { loadReferenceObjects } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwq1TQmKMenaFTzX",
  tableName: "Series",
  fields: {
    name: "fldYMhfaWJn4oUyB5",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type StringFields = {
  [fieldId in FieldIds]: string;
};
type SeriesRecord = StringFields & RecordBase;

export type Series = {
  name: string;
  slug: string;
  permalink: Permalink;
};

const materialize = (seriesRow: SeriesRecord): Series => {
  const slug = slugify(seriesRow[fields.name]);
  return {
    name: seriesRow[fields.name],
    slug,
    permalink: `/books/series/${slug}/`,
  };
};

export const loadSeries = async (): Promise<Record<string, Series>> =>
  await loadReferenceObjects<SeriesRecord, Series, never>(SCHEMA, materialize);
