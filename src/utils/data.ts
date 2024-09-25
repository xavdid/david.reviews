import type { Permalink } from "../airtable/types";

export type Category = "book" | "movie" | "game";

/**
 * a function that returns an `s` based on whether a word should be pluralized. Example:
 * ```js
 * `book${pluralize(books)}`
 * ```
 * Will return `book` or `books` correctly depending on the length of a `books` array.
 */
export const pluralize = (l: unknown[] | number): string => {
  let calc;
  if (Array.isArray(l)) {
    calc = l.length > 1;
  } else {
    calc = l > 1;
  }

  return calc ? "s" : "";
};

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

// don't want to make it sound like it was so bad I didn't have anything to say
export const NO_REVIEW = "no additional notes, see rating";
export const collectionPermalink = (
  category: `${Category}s`,
  slug: string,
): Permalink => `/${category}/collections${slug === "" ? "" : `/${slug}`}/`;

export const genrePermalink = (slug: string): Permalink =>
  `/games/genres${slug === "" ? "" : `/${slug}`}/`;

export const averageRating = (items: Array<{ rating: number }>): number =>
  +(
    items.reduce((total, { rating }) => rating + total, 0) / items.length
  ).toFixed(2);

export const minutesToDuration = (totalMinutes: number): string => {
  if (!totalMinutes) {
    return "Unknown Playtime";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return `${hours}h ${minutes}m`;
};

export const seoTitle = (t: string): string => `david.reviews: ${t}`;

export const isProdBuild = import.meta.env.PROD;
