import { expect, test } from "vitest";
import { pluralize } from "./data";

type TestCase = [...Parameters<typeof pluralize>, string];
const pluralizeTestCases: TestCase[] = [
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
