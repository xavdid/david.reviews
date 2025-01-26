import slugify from "@sindresorhus/slugify";

import {
  buildAwardDetails,
  type AwardDetails,
  type AwardTier,
} from "../../awards";
import type { AirtableBase, Permalink, RecordBase } from "../types";
import { loadAuthors, type Author } from "./authors";
import { loadReferenceObjects } from "./common";
import { loadSeries, type Series } from "./series";

const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viw11AUS4q6YsydXs",
  tableName: "Books",
  fields: {
    title: "fldbpYqMmVWPta1vH",
    gbid: "fldVZwAWk0INpKwvd",
    authors: "fld7cSq3WI1jyiAQ5",
    series: "fldpotcy2cUaEcs3c",
    numberInSeries: "fldLhxeBNiO0ARzXN",
    awardTier: "fldKen993AOeWvMnC",
    awardAnchor: "fldhBsaMHcTbP6iYw",
    awardYear: "fld8n2g7b5pgtXPu5",
  },
} as const satisfies AirtableBase;
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
  title: string;
  gbid: string;
  slug: string;
  permalink: Permalink;
  award?: AwardDetails;
  numberInSeries?: number;
  posterUrl: string;
};
type ForeignKeyFields = {
  authors: Author[];
  series?: Series;
};
export type Book = LocalFields & ForeignKeyFields;

const materialize = (bookRow: BookRecord): LocalFields => {
  const slug = slugify(bookRow[fields.title]);
  const item: LocalFields = {
    title: bookRow[fields.title],
    slug,
    permalink: `/books/${slug}/`,
    gbid: bookRow[fields.gbid],
    numberInSeries: bookRow[fields.numberInSeries],
    posterUrl: `https://books.google.com/books/content/images/frontcover/${
      bookRow[fields.gbid]
    }?fife=h188`,
    award: buildAwardDetails(
      bookRow[fields.awardTier],
      bookRow[fields.awardYear],
      bookRow[fields.awardAnchor],
    ),
  };

  return item;
};

export const loadBooks = async (): Promise<Record<string, Book>> =>
  await loadReferenceObjects(SCHEMA, materialize, [
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
