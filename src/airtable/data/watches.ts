import type { Base } from "../types";
import { loadListedRecords } from "./common";
import { loadMaterializedMovies, type MaterialzedMovie } from "./movies";

export const SCHEMA = {
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

export const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.isFirstWatch]: 0 | 1;
  [fields.movie]: [string];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

type WatchRecord = StringFields & NonStringFields;

type LocalFields = {
  rating: number;
  notes: string;
  dateWatched: string;
  isFirstWatch: boolean;
};
type ForeignKeyFields = {
  movie: MaterialzedMovie;
};

export type MaterialzedWatch = LocalFields & ForeignKeyFields;

const materializer = (watchRow: WatchRecord): LocalFields => ({
  rating: watchRow[fields.rating],
  notes: watchRow[fields.notes],
  dateWatched: watchRow[fields.dateWatched],
  isFirstWatch: watchRow[fields.isFirstWatch] === 1,
});

export const loadWatches = async (): Promise<MaterialzedWatch[]> =>
  loadListedRecords(SCHEMA, materializer, [
    {
      key: "movie",
      foreignItems: await loadMaterializedMovies(),
      keyGrabber: (watchRow) => watchRow[fields.movie],
    },
  ]);
