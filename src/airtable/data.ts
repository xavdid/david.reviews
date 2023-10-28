import Airtable from "airtable";
import { BASES } from "./constants";

const client = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY });

export const movieBase = client.base(BASES.movies.id);
export const bookBase = client.base(BASES.books.id);
export const gameBase = client.base(BASES.games.id);
