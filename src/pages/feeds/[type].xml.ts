import type { APIRoute } from "astro";

import type { Book } from "../../airtable/data/books";
import type { Game } from "../../airtable/data/games";
import type { Movie } from "../../airtable/data/movies";
import { loadPlays } from "../../airtable/data/plays";
import { loadReads } from "../../airtable/data/reads";
import { loadWatches } from "../../airtable/data/watches";
import type { Permalink } from "../../airtable/types";
import { getPublishedArticles } from "../../utils/content";
import { type Category } from "../../utils/data";
import { buildRssFeed, feedTypes, slimReview } from "../../utils/rss";

type Feeds = (typeof feedTypes)[number];

type StaticPath = {
  params: { type: Feeds };
};

// generates an RSS feed for each item in this list
export const getStaticPaths = (): StaticPath[] =>
  feedTypes.map((type) => ({ params: { type } }));

const reviews: Record<
  Exclude<Feeds, "everything">,
  Array<
    | {
        type: Category;
        media: Book | Movie | Game;
        dateFinished: string;
        rating: number;
        notes: string;
      }
    | {
        type: "article";
        title: string;
        dateFinished: string;
        permalink: Permalink;
        blurb: string;
      }
  >
> = {
  books: (await loadReads()).map(({ book: media, ...review }) => ({
    type: "book",
    media,
    ...review,
  })),
  games: (await loadPlays()).map(({ game: media, ...review }) => ({
    type: "game",
    media,
    ...review,
  })),
  movies: (await loadWatches()).map(({ movie: media, ...review }) => ({
    type: "movie",
    media,
    ...review,
  })),
  articles: (await getPublishedArticles()).map((article) => ({
    type: "article",
    title: article.data.title,
    blurb: article.data.ogDesc,
    dateFinished: article.data.publishedOn ?? new Date().toISOString(),
    permalink: article.permalink,
  })),
};

export const GET: APIRoute = async (context) => {
  const feedType = context.params.type as Feeds;
  const items =
    feedType === "everything"
      ? [
          ...reviews.games,
          ...reviews.books,
          ...reviews.movies,
          ...reviews.articles,
        ]
      : reviews[feedType];

  const singular = {
    games: "game",
    books: "book",
    movies: "movie",
    everything: "media",
    articles: "article",
  }[feedType];

  return await buildRssFeed(
    context,
    singular,
    items,
    (item) => {
      if (item.type === "article") {
        return {
          title:
            feedType === "everything" ? `Article: ${item.title}` : item.title,
          link: item.permalink,
          pubDate: new Date(item.dateFinished),
          content: [
            item.blurb,
            "<br /><br />",
            `<a href="${item.permalink}">Read the whole thing</a>.`,
          ].join("\n"),
        };
      }

      return {
        title: `david.reviews: ${
          feedType === "everything" ? `the ${item.type} ` : ""
        }"${item.media.title}"`,
        link: item.media.permalink,
        pubDate: new Date(item.dateFinished),
        content: slimReview(item.rating, item.notes),
      };
    },
    feedType === "everything" ? "everything" : undefined,
  );
};
