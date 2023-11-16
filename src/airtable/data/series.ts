import slugify from "@sindresorhus/slugify";
import type { Base } from "../types";
import { loadReferenceRecords } from "./common";

export const SCHEMA = {
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

type SeriesRecord = StringFields & NonStringFields;

export type MaterializedSeries = {
  name: string;
  slug: string;
};

const materializeSeries = (seriesRow: SeriesRecord): MaterializedSeries => ({
  name: seriesRow[fields.name],
  slug: slugify(seriesRow[fields.name]),
});

export const loadMaterializedSeries = () =>
  loadReferenceRecords<SeriesRecord, MaterializedSeries, never>(
    SCHEMA,
    materializeSeries,
  );
