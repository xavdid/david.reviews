import slugify from "@sindresorhus/slugify";

import type {
  AirtableBase,
  AwardDetails,
  AwardTier,
  RecordBase,
} from "../types";
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
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.numWatches]: number;
  [fields.awardTier]?: AwardTier;
  [fields.awardAnchor]?: string;
  [fields.awardYear]: number; // always defined because it's calculated; unwatched movies are `0`, but those are filtered
  [fields.yearReleased]: number;
  [fields.averageScore]: number;
  [fields.collections]?: string[];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type MovieRecord = StringFields & NonStringFields & RecordBase;

export type Collection = {
  fullName: string;
  emoji: string;
  slug: string;
};

export type Movie = {
  tmdbId: string;
  title: string;
  slug: string;
  yearReleased: number;
  numWatches: number;
  collections?: Collection[];
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
    collections: movieRow[fields.collections]?.map((c) => ({
      fullName: c,
      // need to split the string to find the emoji, don't just take the first character
      emoji: c.split(" ")[0],
      slug: slugify(c),
    })),
    posterUrl: `https://image.tmdb.org/t/p/w300${movieRow[fields.posterPath]}`,
  };

  if (movieRow[fields.awardTier]) {
    item.award = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tier: movieRow[fields.awardTier]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      year: movieRow[fields.awardYear]!,
      anchor: movieRow[fields.awardAnchor]
        ? `#${movieRow[fields.awardAnchor]}`
        : undefined,
    };
  }

  return item;
};

export const loadMovies = async (): Promise<Record<string, Movie>> =>
  await loadReferenceRecords<MovieRecord, Movie, never>(SCHEMA, materialize);
