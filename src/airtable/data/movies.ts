import slugify from "@sindresorhus/slugify";

import type { AwardDetails, AwardTier, Base, RecordBase } from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
  baseId: "appctKQDyHbyqNJOY",
  viewId: "viwEn5Vs4zVmEHvSH",
  tableName: "Movies",
  fields: {
    title: "fldTnYNwU1nDCbVr4",
    numWatches: "fldjw4L2x9amvkPoC",
    tmdbId: "fld08lT0KsDWPAusk",
    awardTier: "fldCv6iiAWI2dezEV",
    awardAnchor: "fld4baGMFIIdjuC8v",
    awardYear: "fld3rjdnSFEMLGsPh",
    yearReleased: "fldjlzKYb5BNa56LN",
    collections: "fldQHNpHO95v5XR2d",
    averageScore: "fldEFOtQZiXwUxDRf",
    posterPath: "fldRZ4cnbzJNVVoHq",
  },
} as const satisfies Base;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.numWatches]: number;
  [fields.awardTier]?: AwardTier;
  [fields.awardAnchor]?: string;
  [fields.awardYear]: number; // always defined because it's calculated; unwatched movies are `0`, but those are filtered
  [fields.yearReleased]: number;
  [fields.averageScore]: number;
  [fields.collections]: string[];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type MovieRecord = StringFields & NonStringFields & RecordBase;

export type Movie = {
  tmdbId: string;
  title: string;
  slug: string;
  yearReleased: number;
  numWatches: number;
  collections: string[];
  posterUrl: string;
  award?: AwardDetails;
};

const materialize = (movieRow: MovieRecord): Movie => {
  const item: Movie = {
    tmdbId: movieRow[fields.tmdbId],
    title: movieRow[fields.title],
    slug: slugify(`${movieRow[fields.title]} ${movieRow[fields.yearReleased]}`),
    yearReleased: movieRow[fields.yearReleased],
    numWatches: movieRow[fields.numWatches],
    collections: movieRow[fields.collections],
    posterUrl: `https://image.tmdb.org/t/p/w300${movieRow[fields.posterPath]}`,
  };

  if (movieRow[fields.awardTier]) {
    item.award = {
      tier: movieRow[fields.awardTier]!,
      year: movieRow[fields.awardYear]!,
      anchor: movieRow[fields.awardAnchor],
    };
  }

  return item;
};

export const loadMovies = () =>
  loadReferenceRecords<MovieRecord, Movie, never>(SCHEMA, materialize);
