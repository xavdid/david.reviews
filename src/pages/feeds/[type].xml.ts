import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIRoute } from "astro";

import type { Book } from "../../airtable/data/books";
import type { Game } from "../../airtable/data/games";
import type { Movie } from "../../airtable/data/movies";
import { loadPlays } from "../../airtable/data/plays";
import { loadReads } from "../../airtable/data/reads";
import { loadWatches } from "../../airtable/data/watches";
import type { Permalink } from "../../airtable/types";
import { articlePermalink, getPublishedArticles } from "../../utils/content";
import {
  capitalize,
  type Category,
  ratingPage,
  slimReview,
  sortDateDescending,
} from "../../utils/data";
import { feedTypes } from "../../utils/rss";

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
        fullReviewSlug?: string;
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
  const isEverythingFeed = feedType === "everything";
  const items = isEverythingFeed
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

  const { site } = context;
  if (!site) {
    throw new Error("must set site url!");
  }

  const plural = isEverythingFeed ? "everything" : singular + "s";

  return await rss({
    title: `david.reviews: ${capitalize(plural)}!`,
    description: `A feed of the 50 most recent ${
      singular === "article" ? "articles" : `${singular} reviews`
    } I've posted.`,
    site,
    items: items
      // it's important that these stay sorted
      .toSorted(sortDateDescending)
      .slice(0, 50)
      .map((item): RSSFeedItem => {
        // might want to increment this for things published the same day, since clients might not respect the actual feed ordering
        const pubDate = new Date(item.dateFinished);

        return item.type === "article"
          ? {
              title: isEverythingFeed ? `Article: ${item.title}` : item.title,
              link: item.permalink,
              pubDate,
              content: [
                item.blurb,
                "<br /><br />",
                `<a href="${item.permalink}">Read the whole thing</a>.`,
              ].join("\n"),
            }
          : {
              title: `david.reviews: ${
                isEverythingFeed ? `the ${item.type} ` : ""
              }"${item.media.title}"`,
              link: item.media.permalink,
              pubDate,
              content: [
                slimReview(
                  item.rating,
                  item.notes,
                  ({ game: "plays", movie: "watches", book: "reads" } as const)[
                    item.type
                  ],
                ) +
                  `${
                    item.fullReviewSlug
                      ? ` Read more in my <a href="${articlePermalink(
                          item.fullReviewSlug,
                        )}">full review</a>.`
                      : ""
                  }`,
                "<br /><hr />",
                `FYI: My reviews are scored <a href="${ratingPage(
                  // @ts-expect-error - this is correct, i'm just lax with some string types
                  item.type + "s",
                )}">out of 4</a>. Also, thanks for subscribing to my RSS feed and supporting the indie web!`,
              ].join("\n"),
            };
      }),
  });
};
