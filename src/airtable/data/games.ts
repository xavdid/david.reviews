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
  [fields.simpleGenre]?: string;
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
    genre: gameRow[fields.simpleGenre] ?? "UNKNOWN",
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

// map of genre slug => genre description
// used in: "XXX games are categorized by a primary gameplay loop of YYY"

export const GENRE_DESCRIPTIONS: Record<string, `${string}.`> = {
  "base-building":
    "building structures and being able to customize the layout of your home area.",
  "bullet-hell": "having to avoid flying projectices.",
  "management-sim": "managing resources and expanding capabilities over time.",
  metroidvania:
    "large, interconnected maps and progression blocked by ability acquisition.",
  "open-world":
    "self-directed story progression and (probably) many icons placed on a map.",
  platformer: "running and jumping while trying not to fall off.",
  programming: "puzzles, but with a focus on algorithms or actual code.",
  punching:
    "combat where pressing a button corresponds to throwing a punch or swinging a sword. Most action games fall into this category.",
  puzzle: "solving puzzles, either atmospheric or explicit.",
  racing: "going fast.",
  rhythm: "doing something rhythmically.",
  roguelike: "a repetitious gameplay loop where you improve or grow over time.",
  rts: "making split-second decisions to achieve your load; pausing may be possible.",
  shooting: "aiming and firing.",
  sports: "playing matches where someone wins.",
  stealth: "doing your best not to be seen or caught.",
  survival: "defending yourself (or your squad) against the environment.",
  tactics: "commanding an army or party across a grid.",
  "turn-based": "taking discrete, alternating, un-timed turns in combat.",
  "walk-and-talk": "advancing dialogue or exploring without danger.",
} as const;
