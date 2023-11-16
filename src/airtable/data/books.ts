import slugify from "@sindresorhus/slugify";
import type { AwardDetails, AwardTier, Base } from "../types";
import { loadMaterializedAuthors, type MaterializedAuthor } from "./authors";
import { loadReferenceRecords } from "./common";
import { loadMaterializedSeries, type MaterializedSeries } from "./series";

export const SCHEMA = {
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

type BookRecord = StringFields & NonStringFields;

type LocalFields = {
  name: string;
  gbid: string;
  slug: string;
  award?: AwardDetails;
  numberInSeries?: number;
};
type ForeignKeyFields = {
  authors: MaterializedAuthor[];
  series?: MaterializedSeries;
};

export type MaterializedBook = LocalFields & ForeignKeyFields;

const materializeBook = (bookRow: BookRecord): LocalFields => {
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

export const loadMaterializedBooks = async (): Promise<{
  [recordId: string]: MaterializedBook;
}> =>
  loadReferenceRecords(SCHEMA, materializeBook, [
    {
      key: "series",
      foreignItems: await loadMaterializedSeries(),
      keyGrabber: (bookRow) => bookRow[fields.series],
    },
    {
      key: "authors",
      foreignItems: await loadMaterializedAuthors(),
      keyGrabber: (bookRow) => bookRow[fields.series],
      condense: false,
    },
  ]);
