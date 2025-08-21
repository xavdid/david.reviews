import type { AirtableBase, RecordBase } from "../types";
import { loadListedObjects } from "./common";
import { loadMovies, type Movie } from "./movies";

const SCHEMA = {
  baseId: "appctKQDyHbyqNJOY",
  viewId: "viwovZ8M1YpRtgpFS",
  tableName: "Watches",
  // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches:fields
  fields: {
    recordId: "fldRdLYZsXmAgyO0Q",
    dateWatched: "fldhJwKvRV18ox99t",
    isFirstWatch: "fldpSxAP9mpw0D7V6",
    rating: "fld120ruFVH8sml4B",
    notes: "fldHCPMRJrOOiZxca",
    movie: "fldhAqjnIaBR90xr1",
    watchLocation: "fldvmr7hYhHmA2H9Z",
  },
} as const satisfies AirtableBase;
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
  recordId: string;
  rating: number;
  notes: string;
  dateFinished: string;
  isFirstWatch: boolean;
  watchedInTheater: boolean;
  category: "movie";
};
type ForeignKeyFields = {
  movie: Movie;
};
export type Watch = LocalFields & ForeignKeyFields;

const materialize = (watchRow: WatchRecord): LocalFields => ({
  recordId: watchRow[fields.recordId],
  rating: watchRow[fields.rating],
  notes: watchRow[fields.notes] ?? "",
  dateFinished: watchRow[fields.dateWatched],
  isFirstWatch: watchRow[fields.isFirstWatch] === 1,
  watchedInTheater: watchRow[fields.watchLocation] === "Theater",
  category: "movie",
});

export const loadWatches = async (): Promise<Watch[]> =>
  await loadListedObjects(SCHEMA, materialize, [
    {
      key: "movie",
      foreignItems: await loadMovies(),
      keyGrabber: (watchRow) => watchRow[fields.movie],
    },
  ]);
