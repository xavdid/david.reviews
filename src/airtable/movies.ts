import { loadAllRecords, type AwardTier, type Base } from "./common";

export const SCHEMA = {
  baseId: "appctKQDyHbyqNJOY",
  viewId: "viwovZ8M1YpRtgpFS",
  tableName: "Watches",
  // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches:fields
  fields: {
    title: "fldv3t6rmcVNEW9xN",
    dateWatched: "fldhJwKvRV18ox99t",
    isFirstWatch: "fldpSxAP9mpw0D7V6",
    rating: "fld120ruFVH8sml4B",
    notes: "fldHCPMRJrOOiZxca",
    tmdbID: "fldquYvRJYLZhvfvA",
    posterPath: "fldgUqyuGvEV9ESj8",
    collections: "fldy9V32NQfusaaVP",
    awardTier: "fldmW9FgOxwCcgmGE",
    awardYear: "fldr8qhnvoNTpykWe",
    awardAnchor: "fldsBFKQ9Z8Uv6SDe",
    totalMovieWatches: "fldIcHiMwU6eMo3GG",
    yearReleased: "fldlzig4CUREoZ9Yn",
  },
} as const satisfies Base;

export const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.isFirstWatch]: 0 | 1;
  [fields.tmdbID]: [string];
  [fields.collections]?: string[];
  [fields.awardTier]?: [AwardTier];
  [fields.awardYear]?: [number];
  [fields.awardAnchor]?: [string];
  [fields.totalMovieWatches]: number;
  [fields.yearReleased]: [number];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

type MovieReview = StringFields & NonStringFields;

export const loadWatches = async (): Promise<
  ({ recordId: string } & MovieReview)[]
> => {
  const watchRows = await loadAllRecords<MovieReview>(SCHEMA);
  return watchRows;
};
