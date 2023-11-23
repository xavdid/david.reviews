import type { AirtableBase, RecordBase } from "../types";
import { loadListedRecords } from "./common";
import { loadGames, type Game } from "./games";
import { type PlayTypes } from "./plays";

const SCHEMA = {
  baseId: "appLZQMgewaSP7Gg3",
  viewId: "viwRkRUty4cPtO2EK",
  tableName: "Playthroughs",
  fields: {
    playType: "fldTLUb4amLT7GfQr",
    dateStarted: "fldfnzNqBRu8LSE9g",
    game: "fldTihZHDDFfttVoA",
  },
} as const satisfies AirtableBase;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.game]: [string];
  [fields.playType]: PlayTypes;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type PlayRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  playType: PlayTypes;
  dateStarted: string;
};
type ForeignKeyFields = {
  game: Game;
};
export type InProgressPlay = LocalFields & ForeignKeyFields;

const materialize = (playRow: PlayRecord): LocalFields => ({
  dateStarted: playRow[fields.dateStarted],
  playType: playRow[fields.playType],
});

export const loadInProgessPlays = async (): Promise<InProgressPlay[]> =>
  await loadListedRecords(SCHEMA, materialize, [
    {
      key: "game",
      foreignItems: await loadGames(),
      keyGrabber: (watchRow) => watchRow[fields.game],
    },
  ]);
