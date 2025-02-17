import type { APIRoute } from "astro";
import { loadPlays } from "../../airtable/data/plays";
import { loadReads } from "../../airtable/data/reads";
import { loadWatches } from "../../airtable/data/watches";
import {
  isProdBuild,
  slimReview,
  truncate,
  type Category,
} from "../../utils/data";

type CompletedItem = {
  category: Category;
  recordId: string;
  permalink: string;
  ogImgUrl: string;
  ogDescription: string;
  title: string;
  titleCapitalized: string;
  dateFinished: string;
  shouldAutoPost: boolean;
  offset: number;
};

const buildOgDesc = (
  rating: number,
  notes: string,
  verbNoun: "plays" | "watches" | "reads",
): string => truncate(slimReview(rating, notes, verbNoun));

// could probably DRY this up? idk

export const GET: APIRoute = async () => {
  const plays: CompletedItem[] = (await loadPlays())
    .slice(0, 50)
    .map(
      ({
        recordId,
        dateFinished,
        shouldAutoPost,
        notes,
        rating,
        game: { permalink, title, bigPosterUrl },
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
        offset: 0,
      }),
    );

  const watches: CompletedItem[] = (await loadWatches())
    .slice(0, 50)
    .map(
      ({
        recordId,
        dateFinished,
        notes,
        rating,
        movie: { permalink, bigPosterUrl, title },
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
        offset: 0,
      }),
    );

  const reads: CompletedItem[] = (await loadReads())
    .slice(0, 50)
    .map(
      ({
        recordId,
        dateFinished,
        notes,
        rating,
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
        shouldAutoPost: true,
        offset: 0,
      }),
    );

  const result = {
    // zapier expects this key
    completedItems: [...plays, ...watches, ...reads].toSorted(
      (a, b) =>
        new Date(b.dateFinished).valueOf() - new Date(a.dateFinished).valueOf(),
    ),
  };

  result.completedItems.forEach((i) => {
    i.offset = 3;
  });

  return new Response(JSON.stringify(result, null, isProdBuild ? 0 : 2));
};
