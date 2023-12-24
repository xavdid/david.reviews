import type { APIRoute } from "astro";

import { loadReads } from "../../airtable/data/reads";
import { buildRssFeed, slimReview } from "../../utils";

export const GET: APIRoute = async (context) =>
  await buildRssFeed(context, "book", await loadReads(), (read) => ({
    title: `david.reviews: ${read.book.title}`,
    link: read.book.permalink,
    pubDate: new Date(read.dateFinished),
    content: slimReview(read.rating, read.notes),
  }));
