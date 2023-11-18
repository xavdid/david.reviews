import type { Base, RecordBase } from "../types";
import { loadListedRecords } from "./common";
import { loadMovies, type Movie } from "./movies";

const SCHEMA = {
  baseId: "appctKQDyHbyqNJOY",
  viewId: "viwovZ8M1YpRtgpFS",
  tableName: "Watches",
  // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches:fields
  fields: {
    dateWatched: "fldhJwKvRV18ox99t",
    isFirstWatch: "fldpSxAP9mpw0D7V6",
    rating: "fld120ruFVH8sml4B",
    notes: "fldHCPMRJrOOiZxca",
    movie: "fldhAqjnIaBR90xr1",
  },
} as const satisfies Base;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.isFirstWatch]: 0 | 1;
  [fields.movie]: [string];
  [fields.notes]?: string;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type WatchRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  rating: number;
  notes: string;
  dateWatched: string;
  isFirstWatch: boolean;
};
type ForeignKeyFields = {
  movie: Movie;
};
export type Watch = LocalFields & ForeignKeyFields;

const materialize = (watchRow: WatchRecord): LocalFields => ({
  rating: watchRow[fields.rating],
  notes: watchRow[fields.notes] ?? "",
  dateWatched: watchRow[fields.dateWatched],
  isFirstWatch: watchRow[fields.isFirstWatch] === 1,
});

export const loadWatches = async (): Promise<Watch[]> =>
  await loadListedRecords(SCHEMA, materialize, [
    {
      key: "movie",
      foreignItems: await loadMovies(),
      keyGrabber: (watchRow) => watchRow[fields.movie],
    },
  ]);
