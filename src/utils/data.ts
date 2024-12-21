import slugify from "@sindresorhus/slugify";
import type { Collection, Permalink } from "../airtable/types";

export type Category = "book" | "movie" | "game";

/**
 * a function that returns an `s` based on whether a word should be pluralized. Example:
 * ```js
 * `book${pluralize(books)}`
 * ```
 * Will return `book` or `books` correctly depending on the length of a `books` array.
 */
export const pluralize = (l: unknown[] | number): string => {
  let calc;
  if (Array.isArray(l)) {
    calc = l.length > 1;
  } else {
    calc = l > 1;
  }

  return calc ? "s" : "";
};

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

// don't want to make it sound like it was so bad I didn't have anything to say
export const noReview = (pluralNoun: "plays" | "watches" | "reads"): string =>
  `no additional notes, see rating and/or other ${pluralNoun}.`;
export const collectionPermalink = (
  category: `${Category}s`,
  slug: string,
): Permalink => `/${category}/collections${slug === "" ? "" : `/${slug}`}/`;

export const materializeCollection = (
  collection: string,
  type: Category,
): Collection => {
  const [emoji, ...name] = collection.split(" ");
  if (!(name.length > 0)) {
    throw new Error(`got collection name without leading emoji: ${collection}`);
  }
  const slug = slugify(collection);
  return {
    fullName: collection,
    // need to split the string to find the emoji, don't just take the first character
    emoji,
    nameOnly: name.join(" "),
    slug,
    permalink: collectionPermalink(`${type}s`, slug),
  };
};

export const genrePermalink = (slug: string): Permalink =>
  `/games/genres${slug === "" ? "" : `/${slug}`}/`;

export const ratingPage = (mediaType: `${Category}s`): Permalink =>
  `/rating/${mediaType}/`;

export const averageRating = (items: Array<{ rating: number }>): number =>
  +(
    items.reduce((total, { rating }) => rating + total, 0) / items.length
  ).toFixed(2);

export const minutesToDuration = (totalMinutes: number): string => {
  if (!totalMinutes) {
    return "Unknown Playtime";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return `${hours}h ${minutes}m`;
};

/**
 * prepeneds `david.reviews` to a share title
 */
export const seoTitle = (t: string): string => `david.reviews: ${t}`;

/**
 * given a nullable updatedDate ISO string and a present date ISO string, return the greater of the two
 */
export const maxIsoDate = (first: string | undefined, next: string): string => {
  if (!first) {
    return next;
  }

  return Date.parse(first) > Date.parse(next) ? first : next;
};

/**
 * inlines info about a review suitable for sharing elsewhere
 */
export const slimReview = (
  rating: number,
  notes: string,
  verbNoun: "plays" | "watches" | "reads",
): string =>
  `${"★".repeat(rating)}${"☆".repeat(4 - rating)}: ${
    notes || noReview(verbNoun)
  }`.trim();

export const isProdBuild = import.meta.env.PROD;

// rough approximation, but it works well enough
const numDaysAgo = (date: string): number =>
  Math.floor((new Date().valueOf() - Date.parse(date)) / (1000 * 60 * 60 * 24));

const truncate = (s: string, length = 200): string => {
  if (s.length <= length) {
    return s;
  }

  return s.substring(0, length) + "...";
};

const isFinalPunctuation = (s: string): boolean =>
  s.endsWith(".") || s.endsWith("?") || s.endsWith("!");

/**
 * Given a media page, generate the SEO blurb that shows up below the title when shared
 * There are 2 modes:
 * 1. a summary of a specific review (its star rating & text)
 * 2. a summary of the page (# reviews & average score)
 *
 * - If there's just one review, then use type 1.
 * - If there's multiple reivews, use type 2, unless...
 * - There's multiple reviews & the latest one is within the N days. Then, treat it as the only review
 *
 * this allows for linking "directly" to a specific review if it's just gone up (when I'm most likely to share it) but blubing the average the rest of the time.
 *
 * Reviews are assumed to be sorted latest -> earliest
 */
export const buildSeoDescription = (
  reviews: Array<{ dateFinished: string; rating: number; notes: string }>,
  verbNoun: "plays" | "watches" | "reads",
): `${string}.` => {
  if (reviews.length === 1 || numDaysAgo(reviews[0].dateFinished) < 15) {
    const desc = truncate(
      slimReview(reviews[0].rating, reviews[0].notes, verbNoun),
    );
    return (isFinalPunctuation(desc) ? desc : desc + ".") as `${string}.`;
  }

  return `It averages ${averageRating(reviews)}⭐ after ${
    reviews.length
  } ${verbNoun}.`;
};
