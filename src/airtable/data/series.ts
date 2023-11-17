import slugify from "@sindresorhus/slugify";
import type { Base, RecordBase } from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwvyQagVr2UQhhNe",
  tableName: "Series",
  fields: {
    name: "fldYMhfaWJn4oUyB5",
  },
} as const satisfies Base;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type SeriesRecord = StringFields & NonStringFields & RecordBase;

export type Series = {
  name: string;
  slug: string;
};

const materialize = (seriesRow: SeriesRecord): Series => ({
  name: seriesRow[fields.name],
  slug: slugify(seriesRow[fields.name]),
});

export const loadSeries = () =>
  loadReferenceRecords<SeriesRecord, Series, never>(SCHEMA, materialize);
