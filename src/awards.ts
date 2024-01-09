export type AwardTier = "Gold" | "Silver" | "Bronze";

export const lookbackLinks: Record<number, string> = {
  // 2023: "https://xavd.id/blog/post/favorite-media-2023/",
  2022: "https://xavd.id/blog/post/favorite-media-2022/",
  2021: "https://xavd.id/blog/post/favorite-media-2021/",
  2020: "https://xavd.id/blog/post/favorite-media-2020/",
  2019: "https://xavd.id/blog/post/my-favorite-media-of-the-year-2019-edition/",
  2018: "https://xavd.id/blog/post/my-favorite-media-2018-edition/",
  2017: "https://xavd.id/blog/post/a-few-more-favorites/",
  2016: "https://xavd.id/blog/post/a-few-of-my-favorite-things/",
} as const;
export const awardYears = Object.keys(lookbackLinks).map((y) => parseInt(y));

export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: `#${string}`;
};

export const buildAwardUrl = (year: number, anchor?: string): string => {
  const url = lookbackLinks[year];

  if (!url) {
    throw new Error(`Missing writeup url for year ${year}`);
  }
  return `${url}${anchor ?? ""}`;
};
