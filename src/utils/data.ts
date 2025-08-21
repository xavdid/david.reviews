import slugify from "@sindresorhus/slugify";
import childProcess from "node:child_process";
import type { Book } from "../airtable/data/books";
import type { Game } from "../airtable/data/games";
import type { Movie } from "../airtable/data/movies";
import type { Play } from "../airtable/data/plays";
import type { Read } from "../airtable/data/reads";
import type { Watch } from "../airtable/data/watches";
import type { Collection, Permalink } from "../airtable/types";

export type Category = "book" | "movie" | "game";

/**
 * take a number and pair of words. Return one or the other based on the length/count of the input. Can add the words together if one is a suffix.
 * Example:
 * ```js
 * asdf
 * ```
 * @param l number or list of items to determine plurality
 * @param singular the singular word
 * @param plural the stuffix to add to `singular`, if the plural is used
 * @param fullReplace if `true`, return `plural` instead of adding it to `singular` if we take the `plural` case
 * @returns the correct word
 */
export const pluralize = (
  l: unknown[] | number,
  singular: string,
  plural = "s",
  fullReplace?: boolean,
): string => {
  const useSuffix = Array.isArray(l) ? l.length > 1 : l > 1;

  if (fullReplace) {
    return useSuffix ? plural : singular;
  }

  return useSuffix ? singular + plural : singular;
};

export const capitalize = (s?: string): string => {
  if (!s) {
    return "";
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

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

export const gamePermalink = (slug: string): Permalink =>
  `/games${slug === "" ? "" : `/${slug}`}/`;

export const genrePermalink = (slug: string): Permalink =>
  `/games/genres${slug === "" ? "" : `/${slug}`}/`;

export const ratingPage = (mediaType: `${Category}s`): Permalink =>
  `/rating/${mediaType}/`;

/**
 * takes a list of reviews and returns an average rounded to 2 decimals.
 */
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
 * inlines info about a review suitable for sharing elsewhere. Used in RSS, and masto/bsky posts, og-desc. It should be a pure string with no HTML or links or anything.
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
export const numDaysAgo = (date: string): number =>
  Math.floor((sortableDateValue() - Date.parse(date)) / (1000 * 60 * 60 * 24));

export const truncate = (s: string, length = 200): string => {
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

// cache this on each server run
let hash = "";
export const getGitSha = (): string => {
  if (hash === "") {
    hash = childProcess
      .execSync("git rev-parse --short HEAD")
      .toString()
      .trim();
  }
  return hash;
};

/**
 * get the last item of an array
 */
export const last = <T>(items: T[]): T => {
  const l = items.length;
  if (l === 0) {
    throw new Error("can't get last item of empty array");
  }

  return items[l - 1];
};

/**
 * takes an nullable date value and returns its unix timestamp - perfect for sorting!
 */
export const sortableDateValue = (d?: string): number =>
  (d ? new Date(d) : new Date()).valueOf();

/**
 * useful for sorting lists of things that have been finished. Newest to oldest.
 */
export const sortDateDescending = (
  a: { dateFinished: string },
  b: { dateFinished: string },
): number =>
  sortableDateValue(b.dateFinished) - sortableDateValue(a.dateFinished);

const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};
/**
 * given any number, return a string with its ordinal attached.
 *
 * ```
 * ordinal(3) // '3rd'
 * ordinal(7) // '7th'
 * ordinal(12) // '12th'
 * ```
 */
export const ordinal = (n: number): string => {
  const category = ordinalRules.select(n);
  const suffix = suffixes[category];
  return `${n}${suffix ?? ""}`;
};

export const isFakeFirstWatch = (
  numWatch: number,
  isFirstWatch: boolean,
): boolean => numWatch === 1 && !isFirstWatch;

export const fakeFirstWatchMarker = (
  numWatch: number,
  isFirstWatch: boolean,
): string => (isFakeFirstWatch(numWatch, isFirstWatch) ? "*" : "");

export const getMedia = <T extends Read | Play | Watch>(
  r: T,
): T extends Read ? Book : T extends Play ? Game : Movie =>
  (r.category === "book"
    ? r.book
    : r.category === "game"
      ? r.game
      : r.movie) as any;
