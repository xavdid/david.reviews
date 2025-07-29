import { getArticlesBySteamId } from "../../utils/content";
import { isProdBuild } from "../../utils/data";
import type { AirtableBase, RecordBase } from "../types";
import { loadListedObjects } from "./common";
import { loadGames, type Game } from "./games";

// https://airtable.com/appLZQMgewaSP7Gg3/api/docs
const SCHEMA = {
  baseId: "appLZQMgewaSP7Gg3",
  viewId: "viwkq3nYj6SIHuujT",
  tableName: "Playthroughs",
  fields: {
    recordId: "fldhwsCGBg9JXtPUm",
    playType: "fldTLUb4amLT7GfQr",
    dateFinished: "fld1gZfopGuA6q13R",
    minutesPlayed: "fldZxVhvYZ193CI3I",
    rating: "fldbLmt1Rduq8odcx",
    notes: "fldKvvBC2dQyQDX5X",
    game: "fldTihZHDDFfttVoA",
    beatIfBeatable: "fldadrp1vEG1npkRK",
    shouldAutoPost: "fldT2QUK5SYjopMz5",
    playedOnSteam: "fldi0LzrevBvRVAl9",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

export type PlayTypes =
  | "First Time"
  | "Replay"
  | "DLC"
  | "Platinum"
  | "New Edition";

const ETCPlayTypes: PlayTypes[] = ["DLC", "Platinum"];
export const isEtcPlay = (s: PlayTypes): boolean => ETCPlayTypes.includes(s);

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.game]: [string];
  [fields.minutesPlayed]: number;
  [fields.playType]: PlayTypes;
  [fields.beatIfBeatable]: "True" | "False" | "N/A";
  [fields.shouldAutoPost]?: true;
  [fields.playedOnSteam]: 0 | 1;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type PlayRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  rating: number;
  notes: string;
  dateFinished: string;
  playType: PlayTypes;
  minutesPlayed: number;
  didNotFinish: boolean;
  recordId: string;
  shouldAutoPost: boolean;
  playedOnSteam: boolean;
  fullReviewSlug?: string;
};
type ForeignKeyFields = {
  game: Game;
};
export type Play = LocalFields & ForeignKeyFields;

const materialize = (playRow: PlayRecord): LocalFields => ({
  recordId: playRow[fields.recordId],
  rating: playRow[fields.rating],
  notes: playRow[fields.notes] ?? "",
  dateFinished: playRow[fields.dateFinished],
  playType: playRow[fields.playType],
  minutesPlayed: playRow[fields.minutesPlayed],
  didNotFinish: playRow[fields.beatIfBeatable] === "False",
  shouldAutoPost: Boolean(playRow[fields.shouldAutoPost]),
  playedOnSteam: Boolean(playRow[fields.playedOnSteam]),
});

const steamIdsToSlugs = await getArticlesBySteamId();

export const loadPlays = async (): Promise<Play[]> => {
  const plays: Play[] = await loadListedObjects(SCHEMA, materialize, [
    {
      key: "game",
      foreignItems: await loadGames(),
      keyGrabber: (watchRow) => watchRow[fields.game],
    },
  ]);
  return plays.map((p) => {
    if (p.playType === "First Time" && p.game.steamId) {
      p.fullReviewSlug = steamIdsToSlugs[p.game.steamId];
    }

    return p;
  });
};

/**
 * get data suitable for adding a playbox to an MDX document. ~~Should only compute data once; all other loads should be fast.~~ See below
 * @param slug the slug of the game to load. May change, but the site will be loud about it
 * @param index All plays are sorted chronologically, earliest to latest. Unless I'm backfilling something, this should be a stable way to point to a play
 */
export const getFinishedPlayForGame = async (
  slug: string,
  {
    index = 0,
    throwForMissing = isProdBuild,
  }: { index?: number; throwForMissing?: boolean },
): Promise<Play | null> => {
  const plays = await loadPlays();
  const playForGame = plays
    .toReversed()
    .filter((p) => p.game.slug === slug)
    .at(index);

  if (!playForGame) {
    const message = `Tried to load review for slug: ${slug}, but it wasn't found`;
    if (throwForMissing) {
      throw new Error(message);
    } else {
      console.warn(message);
      return null;
    }
  }

  return playForGame;
};
