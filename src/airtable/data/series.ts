import slugify from "@sindresorhus/slugify";
import type { AirtableBase, RecordBase } from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwvyQagVr2UQhhNe",
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
};

const materialize = (seriesRow: SeriesRecord): Series => ({
  name: seriesRow[fields.name],
  slug: slugify(seriesRow[fields.name]),
});

export const loadSeries = async (): Promise<Record<string, Series>> =>
  await loadReferenceRecords<SeriesRecord, Series, never>(SCHEMA, materialize);
