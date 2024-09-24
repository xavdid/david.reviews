import rss, { type RSSFeedItem } from "@astrojs/rss";
import { NO_REVIEW } from "./data";

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
  `${"★".repeat(rating)}${"☆".repeat(4 - rating)}: ${notes || NO_REVIEW}`;
