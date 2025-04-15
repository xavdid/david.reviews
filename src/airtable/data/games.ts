import slugify from "@sindresorhus/slugify";

import {
  buildAwardDetails,
  type AwardDetails,
  type AwardTier,
} from "../../awards";
import {
  gamePermalink,
  genrePermalink,
  materializeCollection,
} from "../../utils/data";
import type {
  AirtableBase,
  Collection,
  ExternalUrl,
  Permalink,
  RecordBase,
} from "../types";
import { loadReferenceObjects } from "./common";

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
    collection: "fld3so0K95cIwegiu",
    steamId: "fldn9P97UHVr73R6I",
    dekuDealsSlug: "fld8UuCSUEUipZhTN",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.igdbCoverId]?: string;
  [fields.awardTier]?: AwardTier;
  [fields.simpleGenre]?: string;
  [fields.collection]?: string;
  [fields.awardAnchor]?: string;
  [fields.steamId]?: string;
  [fields.dekuDealsSlug]?: string;
  [fields.awardYear]: number; // always defined because it's calculated; unwatched movies are `0`, but those are filtered
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type GameRecord = StringFields & NonStringFields & RecordBase;

export type Genre = {
  name: string;
  slug: string;
  permalink: Permalink;
};

export type Game = {
  title: string;
  genre: Genre;
  igdbId: string;
  slug: string;
  collection?: Collection;
  permalink: Permalink;
  posterUrl: ExternalUrl;
  bigPosterUrl: ExternalUrl;
  award?: AwardDetails;
  steamUrl?: string;
  dekuDealsUrl?: string;
};

const materialize = (gameRow: GameRecord): Game => {
  const slug = slugify(gameRow[fields.title]);
  const genre =
    gameRow[fields.simpleGenre] ??
    (() => {
      throw new Error(`No genre found for game ${gameRow[fields.title]}`);
    })();
  const genreSlug = slugify(genre);

  const item: Game = {
    title: gameRow[fields.title],
    genre: {
      name: genre,
      slug: genreSlug,
      permalink: genrePermalink(genreSlug),
    },
    igdbId: gameRow[fields.igdbId],
    slug,
    permalink: gamePermalink(slug),
    posterUrl: `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${
      gameRow[fields.igdbCoverId]
    }.jpg`,
    bigPosterUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${
      gameRow[fields.igdbCoverId]
    }.jpg`,
    steamUrl: gameRow[fields.steamId]
      ? // could include curator, but I bet they check the referrer; ?curator_clanid=45203122`
        `https://store.steampowered.com/app/${gameRow[fields.steamId]}/`
      : undefined,
    // use steamId if present, otherwise try the slug, otherwise it's just missing
    dekuDealsUrl: gameRow[fields.steamId]
      ? `https://dekudeals.com/app/${gameRow[fields.steamId]}`
      : gameRow[fields.dekuDealsSlug]
        ? `https://www.dekudeals.com/items/${gameRow[fields.dekuDealsSlug]}`
        : undefined,
    award: buildAwardDetails(
      gameRow[fields.awardTier],
      gameRow[fields.awardYear],
      gameRow[fields.awardAnchor],
    ),
  };

  const collection = gameRow[fields.collection];
  if (collection) {
    item.collection = materializeCollection(collection, "game");
  }

  return item;
};

export const loadGames = async (): Promise<Record<string, Game>> =>
  await loadReferenceObjects<GameRecord, Game, never>(SCHEMA, materialize);

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
  platformer: "running and jumping while trying not to fall off something.",
  programming: "puzzles, but with a focus on algorithms or actual code.",
  punching:
    "combat where pressing a button corresponds to throwing a punch or swinging a sword. Most action games fall into this category.",
  puzzle: "solving puzzles, either atmospheric or explicit.",
  racing: "going fast.",
  rhythm: "doing something rhythmically.",
  roguelike: "a repetitious gameplay loop where you improve or grow over time.",
  rts: "making split-second decisions to achieve your goal; pausing may be possible.",
  shooting: "aiming and firing.",
  sports: "playing matches where someone wins.",
  stealth: "doing your best not to be seen or caught.",
  survival: "defending yourself (or your squad) against the environment.",
  tactics: "commanding an army or party across a grid.",
  "turn-based": "taking discrete, alternating, un-timed turns in combat.",
  "walk-and-talk": "advancing dialogue or exploring without danger.",
} as const;

export const COLLECTION_DESCRIPTIONS: Record<string, `${string}.`> = {
  collaborative:
    "there's only one controller, but all players feel engaged in the story, puzzle solving, and/or decision making.",
  "co-op":
    "2+ players play at the same time using their own controller, working together to accomplish a goal.",
};
