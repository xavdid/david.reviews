import { loadAllRecords, type AwardTier, type Base } from "./common";
import { loadMaterializedMovies, type MaterialzedMovie } from "./movies";

export const SCHEMA = {
  baseId: "appctKQDyHbyqNJOY",
  viewId: "viwovZ8M1YpRtgpFS",
  tableName: "Watches",
  // https://airtable.com/appctKQDyHbyqNJOY/api/docs#javascript/table:watches:fields
  fields: {
    title: "fldv3t6rmcVNEW9xN", // moved
    dateWatched: "fldhJwKvRV18ox99t",
    isFirstWatch: "fldpSxAP9mpw0D7V6",
    rating: "fld120ruFVH8sml4B",
    notes: "fldHCPMRJrOOiZxca",
    movie: "fldhAqjnIaBR90xr1",
    tmdbID: "fldquYvRJYLZhvfvA", // moved
    posterPath: "fldgUqyuGvEV9ESj8", // moved
    collections: "fldy9V32NQfusaaVP", // moved
    awardTier: "fldmW9FgOxwCcgmGE", // moved
    awardYear: "fldr8qhnvoNTpykWe", // moved
    awardAnchor: "fldsBFKQ9Z8Uv6SDe", // moved
    totalMovieWatches: "fldIcHiMwU6eMo3GG", // moved
    yearReleased: "fldlzig4CUREoZ9Yn", // moved
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
  [fields.movie]: [string];
  [fields.yearReleased]: [number];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

type WatchRecord = StringFields & NonStringFields;

export const loadWatches = async (): Promise<
  ({ recordId: string } & WatchRecord)[]
> => {
  const watchRows = await loadAllRecords<WatchRecord>(SCHEMA);
  return watchRows;
};

export type MaterialzedWatch = {
  movie: MaterialzedMovie;
  rating: number;
  notes: string;
  dateWatched: string;
  isFirstWatch: boolean;
};
export const loadMaterializedWatches = async (): Promise<
  MaterialzedWatch[]
> => {
  const movies = await loadMaterializedMovies();

  const watches = await loadWatches();

  return watches.map((watch) => {
    const movie = movies[watch[fields.movie][0]];
    if (!movie) {
      throw new Error(
        `Movie record for watch ${watch[fields.title]} (${
          watch.recordId
        }) not found! - ${watch[fields.movie][0]}`,
      );
    }
    const item: MaterialzedWatch = {
      movie,
      rating: watch[fields.rating],
      notes: watch[fields.notes],
      dateWatched: watch[fields.dateWatched],
      isFirstWatch: watch[fields.isFirstWatch] === 1,
    };
    return item;
  });
};
