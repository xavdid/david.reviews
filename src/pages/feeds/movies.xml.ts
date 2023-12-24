import type { APIRoute } from "astro";

import { loadWatches } from "../../airtable/data/watches";
import { buildRssFeed, slimReview } from "../../utils";

const singular = "movie";

export const GET: APIRoute = async (context) =>
  await buildRssFeed(context, singular, await loadWatches(), (watch) => ({
    title: `david.reviews: ${watch.movie.title}`,
    link: watch.movie.permalink,
    pubDate: new Date(watch.dateFinished),
    content: slimReview(watch.rating, watch.notes),
  }));
