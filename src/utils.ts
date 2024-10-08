import rss, { type RSSFeedItem } from "@astrojs/rss";

import type { Permalink } from "./airtable/types";

export type Category = "book" | "movie" | "game";

export const collectionPermalink = (
  category: `${Category}s`,
  slug: string,
): Permalink => `/${category}/collections${slug === "" ? "" : `/${slug}`}/`;
export const genrePermalink = (slug: string): Permalink =>
  `/games/genres${slug === "" ? "" : `/${slug}`}/`;
export const minutesToDuration = (totalMinutes: number): string => {
  if (!totalMinutes) {
    return "Unknown Playtime";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return `${hours}h ${minutes}m`;
};

export const seoTitle = (t: string): string => `david.reviews: ${t}`;

export type SearchItem = {
  title: string;
  category: Category;
  permalink: string;
};

export const buildRssFeed = async <T extends { dateFinished: string }>(
  { site }: { site: URL | undefined },
  singularItem: string,
  reviews: T[],
  itemizer: (review: T) => RSSFeedItem,
  pluralItem?: string,
): Promise<Response> => {
  if (!site) {
    throw new Error("must set site url!");
  }

  const plural = pluralItem ?? singularItem + "s";
  return await rss({
    title: `david.reviews: ${
      plural.charAt(0).toUpperCase() + plural.slice(1)
    }!`,
    description: `A feed of the 50 most recent ${singularItem} reviews I've posted.`,
    site,
    items: reviews
      // it's important that these stay sorted
      .toSorted(
        (a, b) =>
          new Date(b.dateFinished).valueOf() -
          new Date(a.dateFinished).valueOf(),
      )
      .slice(0, 50)
      .map(itemizer),
  });
};

// don't want to make it sound like it was so bad I didn't have anything to say
export const NO_REVIEW = "no additional notes, see rating";
export const slimReview = (rating: number, notes: string): string =>
  `${"★".repeat(rating)}${"☆".repeat(4 - rating)}: ${notes || NO_REVIEW}`;

export const averageRating = (items: Array<{ rating: number }>): number =>
  +(
    items.reduce((total, { rating }) => rating + total, 0) / items.length
  ).toFixed(2);

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
