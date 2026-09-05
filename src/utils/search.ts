import { type Category } from "./data";

export type SearchItem = {
  title: string;
  category: Category | "article";
  permalink: string;
};
