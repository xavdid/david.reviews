import { BASES } from "./constants";

const watchesFields = BASES.movies.tables.watches.fields;

type FieldIds = (typeof watchesFields)[keyof typeof watchesFields];
type NonStringFields = {
  [watchesFields.rating]: number;
  [watchesFields.isFirstWatch]: 0 | 1;
  [watchesFields.tmdbID]: [string];
  [watchesFields.collections]: string[];
  [watchesFields.award]?: "gold" | "silver" | "bronze";
};
export type StringFields = {
  [fieldId in Exclude<FieldIds, keyof NonStringFields>]: string;
};

export type MovieReview = StringFields & NonStringFields;
