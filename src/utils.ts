import type { Permalink } from "./airtable/types";

export const collectionPermalink = (slug: string): Permalink =>
  `/movies/collections/${slug}/`;
export const genrePermalink = (slug: string): Permalink =>
  `/games/genres/${slug}/`;
export const minutesToDuration = (totalMinutes: number): string => {
  if (!totalMinutes) {
    return "Unknown Playtime";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return `${hours}h ${minutes}m`;
};

export const seoTitle = (t: string): string => `david.reviews: ${t}`;

export type SearchItem = {
  title: string;
  category: "book" | "movie" | "game";
  permalink: string;
};
