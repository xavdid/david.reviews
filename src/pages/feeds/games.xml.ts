import type { APIRoute } from "astro";

import { loadPlays } from "../../airtable/data/plays";
import { buildRssFeed, slimReview } from "../../utils";

export const GET: APIRoute = async (context) =>
  await buildRssFeed(context, "game", await loadPlays(), (play) => ({
    title: `david.reviews: ${play.game.title}`,
    link: play.game.permalink,
    pubDate: new Date(play.dateFinished),
    content: slimReview(play.rating, play.notes),
  }));
