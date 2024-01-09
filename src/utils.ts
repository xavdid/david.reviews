import rss, { type RSSFeedItem } from "@astrojs/rss";

import type { Permalink } from "./airtable/types";

export const collectionPermalink = (slug: string): Permalink =>
  `/movies/collections/${slug}/`;
export const genrePermalink = (slug: string): Permalink =>
  `/games/genres/${slug}/`;
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
  category: "book" | "movie" | "game";
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

export const slimReview = (rating: number, notes: string): string =>
  `${"★".repeat(rating)}${"☆".repeat(4 - rating)}: ${notes || "no review"}`;

export const averageRating = (items: Array<{ rating: number }>): number =>
  +(
    items.reduce((total, { rating }) => rating + total, 0) / items.length
  ).toFixed(2);
