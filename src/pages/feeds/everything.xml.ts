import type { APIRoute } from "astro";

import { loadPlays } from "../../airtable/data/plays";
import { loadReads } from "../../airtable/data/reads";
import { loadWatches } from "../../airtable/data/watches";
import { buildRssFeed, slimReview } from "../../utils";

export const GET: APIRoute = async (context) => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/require-await
  const reviews = [
    ...(await loadReads()).map((r) => ({
      type: "book",
      media: r.book,
      ...r,
    })),
    ...(await loadWatches()).map((m) => ({
      type: "movie",
      media: m.movie,
      ...m,
    })),
    ...(await loadPlays()).map((g) => ({
      type: "game",
      media: g.game,
      ...g,
    })),
  ];

  return await buildRssFeed(
    context,
    "media",
    reviews,
    (review) => ({
      title: `david.reviews: the ${review.type} "${review.media.title}"`,
      link: review.media.permalink,
      pubDate: new Date(review.dateFinished),
      content: slimReview(review.rating, review.notes),
    }),
    "everything",
  );
};
