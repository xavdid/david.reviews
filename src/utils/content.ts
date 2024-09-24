import { getCollection, type CollectionEntry } from "astro:content";
import type { Permalink } from "../airtable/types";
import { isProdBuild } from "./data";

export type Article = CollectionEntry<"articles">;

// https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries
// everything in dev, published only in prod
export const getPublishedArticles = async (): Promise<Article[]> =>
  await getCollection("articles", ({ data: { publishedOn } }) =>
    isProdBuild ? publishedOn : true,
  );

export type ArticleReference = {
  title: string;
  permalink: Permalink;
};
