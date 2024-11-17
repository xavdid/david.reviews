import rss, { type RSSFeedItem } from "@astrojs/rss";
import { capitalize } from "./data";

export const feedTypes = [
  "everything",
  "articles",
  "games",
  "movies",
  "books",
] as const;

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
    title: `david.reviews: ${capitalize(plural)}!`,
    description: `A feed of the 50 most recent ${
      singularItem === "article" ? "articles" : `${singularItem} reviews`
    } I've posted.`,
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
