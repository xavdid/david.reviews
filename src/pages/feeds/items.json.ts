import type { APIRoute } from "astro";
import { loadPlays } from "../../airtable/data/plays";
import { loadReads } from "../../airtable/data/reads";
import { loadWatches } from "../../airtable/data/watches";
import { getPublishedArticles } from "../../utils/content";
import {
  fakeFirstWatchMarker,
  isProdBuild,
  ordinal,
  slimReview,
  sortDateDescending,
  truncate,
  type Category,
} from "../../utils/data";

// Zapier epxects this shape, so modify the zap if you change it in a breaking way
// https://zapier.com/editor/279896688/published
type CompletedItem = {
  // used for filtering
  category: Category | "article";
  // used for deduplicating
  recordId: string;
  permalink: string;
  // bluesky needs these to be built from scratch
  ogImgUrl: string;
  ogDescription: string;
  // also bluesky
  title: string;
  // post body should capitalize
  titleCapitalized: string;
  // sorting
  dateFinished: string;
  // either pulled from airtable, calculated, or just `true`
  shouldAutoPost: boolean;
  // text of the review, useful for sending along elsewhere
  notes: string;
  // useful thing to have
  rating: number;
};

const buildOgDesc = (
  rating: number,
  notes: string,
  verbNoun: "plays" | "watches" | "reads",
): string => truncate(slimReview(rating, notes, verbNoun));

// could probably DRY this up? idk

/**
 * this powers social media auto-posting.
 */
export const GET: APIRoute = async () => {
  const plays: Array<
    CompletedItem & { playedOnSteam: boolean; steamUrl?: string }
  > = (await loadPlays())
    .slice(0, 50)
    .map(
      ({
        recordId,
        dateFinished,
        shouldAutoPost,
        notes,
        rating,
        playedOnSteam,
        game: { permalink, title, bigPosterUrl, steamUrl },
      }) => ({
        recordId,
        permalink: `https://david.reviews${permalink}`,
        ogImgUrl: bigPosterUrl,
        ogDescription: buildOgDesc(rating, notes, "plays"),
        title,
        titleCapitalized: title.toUpperCase(),
        category: "game",
        dateFinished,
        shouldAutoPost,
        playedOnSteam,
        notes,
        rating,
        steamUrl,
      }),
    );

  const watches: Array<CompletedItem & { watchNum: string }> = (
    await loadWatches()
  )
    .slice(0, 50)
    .map(
      ({
        recordId,
        dateFinished,
        notes,
        rating,
        // it's unlikely that a movie shows up in this list twice, but if it did, the later one will have the wrong watch num in the social post
        movie: { permalink, bigPosterUrl, title, numWatches },
        isFirstWatch,
      }) => ({
        recordId,
        permalink: `https://david.reviews${permalink}`,
        ogImgUrl: bigPosterUrl,
        ogDescription: buildOgDesc(rating, notes, "watches"),
        title,
        titleCapitalized: title.toUpperCase(),
        category: "movie",
        dateFinished,
        shouldAutoPost: notes.length > 0,
        notes,
        rating,
        watchNum: `${ordinal(numWatches)}${fakeFirstWatchMarker(
          numWatches,
          isFirstWatch,
        )}`,
      }),
    );

  const reads: CompletedItem[] = (await loadReads()).slice(0, 50).map(
    ({
      recordId,
      dateFinished,
      notes,
      rating,
      shouldAutoPost, // defaults to true, but I can disable
      book: { permalink, posterUrl, title },
    }) => ({
      recordId,
      permalink: `https://david.reviews${permalink}`,
      ogImgUrl: posterUrl,
      ogDescription: buildOgDesc(rating, notes, "reads"),
      title,
      titleCapitalized: title.toUpperCase(),
      category: "book",
      dateFinished,
      shouldAutoPost,
      notes,
      rating,
    }),
  );

  const articles: Array<CompletedItem & { steamId: string }> = (
    await getPublishedArticles()
  )
    .slice(0, 50)
    .filter(({ data: { review } }) => review)
    .map(({ slug, permalink, data: { publishedOn, review } }) => ({
      category: "article",
      permalink: `https://david.reviews${permalink}`,
      // for deduplication
      recordId: slug,
      dateFinished: publishedOn ?? "2035-07-14", // default for testing, since we only have published things here in prod
      steamId: review?.gameInfo.steamId ?? "NON-STEAM",
      // shouldn't autopost this is just so I can hook into it
      shouldAutoPost: false,

      // not relevant
      notes: "",
      rating: 4,
      ogImgUrl: "",
      ogDescription: "",
      title: "",
      titleCapitalized: "",
    }));

  const result = {
    // zapier expects this key
    completedItems: [...plays, ...watches, ...reads, ...articles].toSorted(
      sortDateDescending,
    ),
  };

  return new Response(JSON.stringify(result, null, isProdBuild ? 0 : 2));
};
