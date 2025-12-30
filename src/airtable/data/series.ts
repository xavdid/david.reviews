import { slugify } from "../../utils/data";
import type { AirtableBase, Permalink, RecordBase } from "../types";
import { loadReferenceObjects } from "./common";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwq1TQmKMenaFTzX",
  tableName: "Series",
  fields: {
    name: "fldYMhfaWJn4oUyB5",
    numBooksInSeries: "fldKT1QGhdmSHQUdV",
    rating: "fldbvHodkWRdCOEp2",
    notes: "fldpkcCrdWSYhKFd9",
    percentComplete: "flduJfhZdW8nOV8lM",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]?: number;
  [fields.numBooksInSeries]?: number; // number of books in series, if finished
  [fields.notes]?: string;
  [fields.percentComplete]: number; // float perecentage; -1 is unfinished series
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type SeriesRecord = StringFields & NonStringFields & RecordBase;

export type Series = {
  name: string;
  slug: string;
  permalink: Permalink;
  numBooksInSeries?: number;
  percentComplete?: number;
  remarks?: {
    notes: string;
    rating: number;
  };
};

const materialize = (seriesRow: SeriesRecord): Series => {
  const slug = slugify(seriesRow[fields.name]);
  const o: Series = {
    name: seriesRow[fields.name],
    numBooksInSeries: seriesRow[fields.numBooksInSeries],
    percentComplete: seriesRow[fields.percentComplete],
    slug,
    permalink: `/books/series/${slug}/`,
  };

  const rating = seriesRow[fields.rating];
  const notes = seriesRow[fields.notes];

  if (rating != null && notes) {
    o.remarks = {
      rating,
      notes,
    };
  }

  return o;
};

export const loadSeries = async (): Promise<Record<string, Series>> =>
  await loadReferenceObjects<SeriesRecord, Series, never>(SCHEMA, materialize);
