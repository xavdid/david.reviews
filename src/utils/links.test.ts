import { expect, test } from "vitest";
import { linkMode } from "./links";

test.for([
  ...["https://xavd.id", "mailto:cool@cool.com", "/og.png"].map((h) => [
    h,
    "external",
  ]),
  ...[
    "/games/roottrees/",
    "/games/roottrees/",
    "/games/genre/puzzle/",
    "/movies/kung-fu-panda/",
    "/movies/collections/halloween/",
    "/movies/collections/",
    "/games/collections/",
    "/books/thing/",
    "/books/authors/josiah-bancroft/",
    "/books/series/books-of-babel/",
    "/games/genres/",
    "/books/authors/",
  ].map((h) => [h, "rounded"]),
  ...[
    "/games/",
    "/contact/",
    "/about/",
    "/search/",
    "/books/",
    "/movies/",
    "/rating/games/",
    "/",
    "/articles/the-roottrees-are-dead-review/",
    "/contact/#developers--publishers",
    "/games/awarded/",
    "/games/recommended/",
    "/games/years/2024/",
    "#cool",
  ].map((h) => [h, "subtle"]),
])("%s -> %s", ([href, expected]) => {
  expect(linkMode(href)).toBe(expected);
});
