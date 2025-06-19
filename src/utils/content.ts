import { getCollection, type CollectionEntry } from "astro:content";
import type { Permalink } from "../airtable/types";
import { isProdBuild, sortableDateValue } from "./data";

export type Article = CollectionEntry<"articles">;

export const articlePermalink = (slug: string): Permalink =>
  `/articles/${slug}/`;

// https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries
// everything in dev, published only in prod
export const getPublishedArticles = async (): Promise<
  Array<Article & { permalink: Permalink }>
> =>
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

export type ArticleReference = {
  title: string;
  permalink: Permalink;
};
