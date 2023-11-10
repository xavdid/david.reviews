import { NUM_RECORDS, client, type AwardTier, type Base } from "./common";

export const SCHEMA = {
  baseId: "appv2mhWOgkRhR4rK",
  viewId: "viwqz5EPsfegbEmCP",
  // https://airtable.com/appv2mhWOgkRhR4rK/api/docs#javascript/table:reads
  fields: {
    title: "fldGhXwfauEvXCOxU",
    googleBooksId: "fldFQOw6UZDeMwsf4",
    rating: "fldcYBkA0w9G49ZRr",
    notes: "fldt0Xy3ncrVOxGAI",
    dateFinished: "fldqmKpPjPt6VNgAn",
    isReread: "fldp6jjlmJ5BP7P6w",
    medium: "fld00LRZuJkDXWMsg",
    awardTier: "fldGVg6aMvxsNs8py",
    awardYear: "fldnS7UjNj1HdPNjY",
    awardAnchor: "fldHv829lvw6hXsyD",
    seriesName: "fldeG50NjS7IZFsQb",
    numberInSeries: "fldSdUIsg9exyh8BM",
    authorLastNames: "fld7vlWOOWSpAWk1q",
    authorFullNames: "fldp5tglohwONaZqE",
  },
} as const satisfies Base;

export const fields = SCHEMA.fields;

export type BookMedium = "Paper" | "Digital" | "Audio";

type FieldIds = (typeof fields)[keyof typeof fields];
type NonStringFields = {
  [fields.title]: [string];
  [fields.rating]: number;
  [fields.isReread]: boolean;
  [fields.medium]: BookMedium;
  [fields.awardTier]?: [AwardTier];
  [fields.awardYear]?: [number];
  [fields.awardAnchor]?: [string];
  [fields.googleBooksId]?: [string];
  [fields.seriesName]?: [string];
  [fields.numberInSeries]?: [number];
  [fields.authorLastNames]: string[];
};
type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

export type BookReview = StringFields & NonStringFields;

const bookBase = client.base(SCHEMA.baseId);
export const loadReads = async (): Promise<
  ({ recordId: string } & BookReview)[]
> => {
  const reads = await bookBase
    .table("Reads")
    .select({
      ...{
        view: SCHEMA.viewId,
        fields: [...Object.values(fields)],
        returnFieldsByFieldId: true,
      },
      // maxRecords can't be undefined, has to be number or missing entirely
      ...(NUM_RECORDS ? { maxRecords: NUM_RECORDS } : {}),
    })
    .all();

  const rawReviews = reads.map((read) => ({
    recordId: read.id,
    ...read.fields,
  })) as ({ recordId: string } & BookReview)[];

  // filter out audible-only things for now
  return rawReviews.filter((r) => r[fields.googleBooksId]);
};
