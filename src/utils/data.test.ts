import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  isFakeFirstWatch,
  maxIsoDate,
  numDaysAgo,
  ordinal,
  pluralize,
  slugify,
} from "./data";

type PluralizeTestCase = [
  ...Parameters<typeof pluralize>,
  ReturnType<typeof pluralize>,
];
const pluralizeTestCases: PluralizeTestCase[] = [
  [0, "time", undefined, false, "time"],
  [1, "time", undefined, false, "time"],
  [2, "time", undefined, false, "times"],
  [2, "time", "z", false, "timez"],
  [[], "time", "z", false, "time"],
  [["qwer"], "time", "z", false, "time"],
  [[1, 2, 3], "time", "z", false, "timez"],
  [[1, 2, 3], "time", "z", true, "z"],
  [[], "time", "z", true, "time"],
  [[1], "time", "z", true, "time"],
  [1, "time", "z", true, "time"],
  [2, "time", "z", true, "z"],
];

test.for(pluralizeTestCases)(
  "(%s, %s, %s, %s) -> %s",
  ([items, word, suffix, replace, expected]) => {
    expect(pluralize(items, word, suffix, replace)).toBe(expected);
  },
);

// under normal circumstances, I can't see how the OG data could be being built incorrectly
// but _something_ about the link previews is getting cached in an unexpected way sometimes??
describe("numDaysAgo", () => {
  describe("pushing the night before", () => {
    // I have something that finished today and something that finishes tomorrow. The PT wall clock says it's todayThe actual date of the build is today
    beforeEach(() => {
      // `2025-02-18T05:38:35.569Z`, when I wrote this test; about 9:38pm PT on Feb 17, 2025
      // it's as if I pushed in the evening
      vi.useFakeTimers().setSystemTime(1739857115569);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("published date is today", () => {
      expect(numDaysAgo("2025-02-17")).toEqual(1);
    });

    test("published date is tomorrow", () => {
      expect(numDaysAgo("2025-02-18")).toEqual(0);
    });

    test("published date is weeks ago", () => {
      expect(numDaysAgo("2025-02-01")).toEqual(17);
    });
  });

  describe("regular autobuild", () => {
    // I have something that finished today and something that finishes tomorrow. The PT wall clock says it's todayThe actual date of the build is today
    beforeEach(() => {
      // `2025-02-18T13:07:43.000Z`, the regular build time the morning after I wrote this test; about 5:07am PT on Feb 18, 2025
      // it's as if I pushed in the evening
      vi.useFakeTimers().setSystemTime(1739884063000);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("published date is today", () => {
      expect(numDaysAgo("2025-02-17")).toEqual(1);
    });

    test("published date is tomorrow", () => {
      expect(numDaysAgo("2025-02-18")).toEqual(0);
    });

    test("published date is weeks ago", () => {
      expect(numDaysAgo("2025-02-01")).toEqual(17);
    });
  });
});

type MaxIsoTestCase = [
  ...Parameters<typeof maxIsoDate>,
  ReturnType<typeof maxIsoDate>,
];
const maxIsoTests: MaxIsoTestCase[] = [
  ["2025-05-05", "2025-05-04", "2025-05-05"],
  ["2025-05-05", "2025-05-06", "2025-05-06"],
  ["2025-05-05", "2025-05-05", "2025-05-05"],
  [undefined, "2025-05-05", "2025-05-05"],
];

test.for(maxIsoTests)("(%s, %s, %s, %s) -> %s", ([first, next, expected]) => {
  expect(maxIsoDate(first, next)).toBe(expected);
});

type OrdinalTestCase = [
  ...Parameters<typeof ordinal>,
  ReturnType<typeof ordinal>,
];
const ordinalTests: OrdinalTestCase[] = [
  [1, "1st"],
  [2, "2nd"],
  [3, "3rd"],
  [4, "4th"],
  [11, "11th"],
  [15, "15th"],
  [22, "22nd"],
  [31, "31st"],
];

test.for(ordinalTests)("(%s) -> %s", ([input, expected]) => {
  expect(ordinal(input)).toBe(expected);
});

type FakeFirstWatchTestCase = [
  ...Parameters<typeof isFakeFirstWatch>,
  ReturnType<typeof isFakeFirstWatch>,
];
const fakeFirstWatchTests: FakeFirstWatchTestCase[] = [
  [1, true, false],
  [1, false, true],
  [2, true, false],
  [2, false, false],
];

test.for(fakeFirstWatchTests)(
  "(%s, %s) -> %s",
  ([numWatch, isFirstWatch, expected]) => {
    expect(isFakeFirstWatch(numWatch, isFirstWatch)).toBe(expected);
  },
);

type SlugifyTestCase = [
  ...Parameters<typeof slugify>,
  ReturnType<typeof slugify>,
];
const slugifyTests: SlugifyTestCase[] = [
  ["david", "david"],
  ["Öoo", "ooo"],
  ["God of War Ragnarök", "god-of-war-ragnarok"],
  ["Frugal Wizard's Handbook", "frugal-wizards-handbook"],
];

test.for(slugifyTests)("(%s) -> %s", ([input, expected]) => {
  expect(slugify(input)).toBe(expected);
});
