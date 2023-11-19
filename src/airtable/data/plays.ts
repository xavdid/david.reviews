import type { AirtableBase, RecordBase } from "../types";
import { loadListedRecords } from "./common";
import { loadGames, type Game } from "./games";

const SCHEMA = {
  baseId: "appLZQMgewaSP7Gg3",
  viewId: "viwkq3nYj6SIHuujT",
  tableName: "Playthroughs",
  fields: {
    playType: "fldTLUb4amLT7GfQr",
    dateFinished: "fld1gZfopGuA6q13R",
    minutesPlayed: "fldZxVhvYZ193CI3I",
    rating: "fldbLmt1Rduq8odcx",
    notes: "fldKvvBC2dQyQDX5X",
    game: "fldTihZHDDFfttVoA",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type PlayTypes = "First Time" | "Replay" | "DLC" | "Platinum" | "New Edition";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.rating]: number;
  [fields.game]: [string];
  [fields.minutesPlayed]: number;
  [fields.playType]: PlayTypes;
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
};
type ForeignKeyFields = {
  game: Game;
};
export type Play = LocalFields & ForeignKeyFields;

const materialize = (playRow: PlayRecord): LocalFields => ({
  rating: playRow[fields.rating],
  notes: playRow[fields.notes] ?? "",
  dateFinished: playRow[fields.dateFinished],
  playType: playRow[fields.playType],
  minutesPlayed: playRow[fields.minutesPlayed],
});

export const loadPlays = async (): Promise<Play[]> =>
  await loadListedRecords(SCHEMA, materialize, [
    {
      key: "game",
      foreignItems: await loadGames(),
      keyGrabber: (watchRow) => watchRow[fields.game],
    },
  ]);
