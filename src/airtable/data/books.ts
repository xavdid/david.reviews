import slugify from "@sindresorhus/slugify";

import type { AwardDetails, AwardTier, Base, RecordBase } from "../types";
import { loadAuthors, type Author } from "./authors";
import { loadReferenceRecords } from "./common";
import { loadSeries, type Series } from "./series";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwaexsdFEWc0Hkew",
  tableName: "Books",
  fields: {
    name: "fldbpYqMmVWPta1vH",
    gbid: "fldVZwAWk0INpKwvd",
    authors: "fld7cSq3WI1jyiAQ5",
    series: "fldpotcy2cUaEcs3c",
    numberInSeries: "fldLhxeBNiO0ARzXN",
    awardTier: "fldKen993AOeWvMnC",
    awardAnchor: "fldhBsaMHcTbP6iYw",
    awardYear: "fld8n2g7b5pgtXPu5",
  },
} as const satisfies Base;
const fields = SCHEMA.fields;

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.authors]: string[];
  [fields.series]?: string[];
  [fields.numberInSeries]?: number;
  [fields.awardTier]?: AwardTier;
  [fields.awardYear]: number;
  [fields.awardAnchor]?: string;
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};
type BookRecord = StringFields & NonStringFields & RecordBase;

type LocalFields = {
  name: string;
  gbid: string;
  slug: string;
  award?: AwardDetails;
  numberInSeries?: number;
};
type ForeignKeyFields = {
  authors: Author[];
  series?: Series;
};
export type Book = LocalFields & ForeignKeyFields;

const materialize = (bookRow: BookRecord): LocalFields => {
  const item: LocalFields = {
    name: bookRow[fields.name],
    slug: slugify(bookRow[fields.name]),
    gbid: bookRow[fields.gbid],
    numberInSeries: bookRow[fields.numberInSeries],
  };

  if (bookRow[fields.awardTier]) {
    item.award = {
      tier: bookRow[fields.awardTier]!,
      year: bookRow[fields.awardYear]!,
      anchor: bookRow[fields.awardAnchor],
    };
  }

  return item;
};

export const loadBooks = async (): Promise<{
  [recordId: string]: Book;
}> =>
  loadReferenceRecords(SCHEMA, materialize, [
    {
      key: "series",
      foreignItems: await loadSeries(),
      keyGrabber: (bookRow) => bookRow[fields.series],
    },
    {
      key: "authors",
      foreignItems: await loadAuthors(),
      keyGrabber: (bookRow) => bookRow[fields.authors],
      condense: false,
    },
  ]);
