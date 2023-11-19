import slugify from "@sindresorhus/slugify";

import type {
  AirtableBase,
  AwardDetails,
  AwardTier,
  RecordBase,
} from "../types";
import { loadReferenceRecords } from "./common";

const SCHEMA = {
  baseId: "appLZQMgewaSP7Gg3",
  viewId: "viwB0COHcJcL4sV1E",
  tableName: "Games",
  fields: {
    title: "fldWftbZOozPdhs7I",
    simpleGenre: "fldsd9iMSYGty15Mx",
    igdbId: "fldy41ZEIsWNzS65J",
    igdbCoverId: "fldMlWr8cA6gpDbEN",
    awardYear: "fldKAoXfWGvpVAzOR",
    awardTier: "fldAPUbtMJspTm2bP",
    awardAnchor: "fldvFTgyv1c2Q5M1G",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.igdbCoverId]?: string;
  [fields.awardTier]?: AwardTier;
  [fields.awardAnchor]?: string;
  [fields.awardYear]: number; // always defined because it's calculated; unwatched movies are `0`, but those are filtered
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type GameRecord = StringFields & NonStringFields & RecordBase;

export type Game = {
  title: string;
  genre: string;
  igdbId: string;
  slug: string;
  posterUrl: string;
  award?: AwardDetails;
};

const materialize = (gameRow: GameRecord): Game => {
  const item: Game = {
    title: gameRow[fields.title],
    genre: gameRow[fields.simpleGenre],
    igdbId: gameRow[fields.igdbId],
    slug: slugify(gameRow[fields.title]),
    posterUrl: `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${
      gameRow[fields.igdbCoverId]
    }.jpg`,
  };

  if (gameRow[fields.awardTier]) {
    item.award = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tier: gameRow[fields.awardTier]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      year: gameRow[fields.awardYear]!,
      anchor: gameRow[fields.awardAnchor],
    };
  }

  return item;
};

export const loadGames = async (): Promise<Record<string, Game>> =>
  await loadReferenceRecords<GameRecord, Game, never>(SCHEMA, materialize);
