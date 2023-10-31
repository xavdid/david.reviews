import { BASES } from "./constants";

const watchesFields = BASES.movies.tables.watches.fields;
type ValidFields = (typeof watchesFields)[keyof typeof watchesFields];

export type MovieReview = {
  // TODO: not knowing field names means I don't have compelx types here; everything isn't a string
  [fieldId in ValidFields]: string;
};
