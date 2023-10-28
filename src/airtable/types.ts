import { BASES } from "./constants";

const watchesFields = BASES.movies.tables.watches.fields;
type ValidFields = (typeof watchesFields)[keyof typeof watchesFields];

export type MovieReview = {
  [fieldId in ValidFields]: string;
};
