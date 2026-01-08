import { getCollection, type CollectionEntry } from "astro:content";
import type { Permalink } from "../airtable/types";
import { isProdBuild, sortableDateValue } from "./data";

export type Article = CollectionEntry<"articles"> & { permalink: Permalink };
export const ARTICLE_TYPES = [
  "Review",
  "Meta",
  "Roundup",
  "Design",
  "Yearly Favorites",
] as const;

export const articlePermalink = (slug: string): Permalink =>
  `/articles/${slug}/`;

// https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries
// everything in dev, published only in prod
export const getPublishedArticles = async (): Promise<Article[]> =>
  (
    await getCollection("articles", ({ data: { publishedOn } }) =>
      isProdBuild ? publishedOn : true,
    )
  )
    .map((article) => ({
      ...article,
      permalink: articlePermalink(article.slug),
    }))
    .toSorted(
      (a, b) =>
        sortableDateValue(b.data.publishedOn) -
        sortableDateValue(a.data.publishedOn),
    );
type SteamIdToSlug = Record<string, string>;
export const getArticlesBySteamId = async (): Promise<SteamIdToSlug> => {
  const articles = await getPublishedArticles();

  return articles.reduce<SteamIdToSlug>((result, article) => {
    if (article.data.review?.gameInfo.steamId) {
      result[article.data.review?.gameInfo.steamId] = article.slug;
    }

    return result;
  }, {});
};

export type ArticleReference = {
  title: string;
  permalink: Permalink;
};
