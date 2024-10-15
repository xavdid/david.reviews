import slugify from "@sindresorhus/slugify";

import { type AwardDetails, type AwardTier } from "../../awards";
import { materializeCollection } from "../../utils/data";
import type {
  AirtableBase,
  Collection,
  ExternalUrl,
  Permalink,
  RecordBase,
} from "../types";
import { loadReferenceObjects } from "./common";

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

export type Movie = {
  tmdbId: string;
  title: string;
  slug: string;
  permalink: Permalink;
  yearReleased: number;
  averageScore: number;
  numWatches: number;
  collections?: Collection[];
  posterUrl: ExternalUrl;
  bigPosterUrl: ExternalUrl;
  award?: AwardDetails;
};

const materialize = (movieRow: MovieRecord): Movie => {
  const slug = slugify(
    `${movieRow[fields.title]} ${movieRow[fields.yearReleased]}`,
  );
  const item: Movie = {
    tmdbId: movieRow[fields.tmdbId],
    title: movieRow[fields.title],
    slug,
    permalink: `/movies/${slug}/`,
    yearReleased: movieRow[fields.yearReleased],
    numWatches: movieRow[fields.numWatches],
    averageScore: movieRow[fields.averageScore],
    collections: movieRow[fields.collections]?.map((c) =>
      materializeCollection(c, "movie"),
    ),
    posterUrl: `https://image.tmdb.org/t/p/w300${movieRow[fields.posterPath]}`,
    bigPosterUrl: `https://image.tmdb.org/t/p/w500${
      movieRow[fields.posterPath]
    }`,
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
  await loadReferenceObjects<MovieRecord, Movie, never>(SCHEMA, materialize);
