import Fuse, { type FuseIndex } from "fuse.js/min-basic";
import { type JSX } from "preact";
import { useMemo, useState } from "preact/hooks";

import { type SearchItem } from "../utils/search";
import { SearchResult } from "./SearchResult";

type Props = {
  items: SearchItem[];
  index: FuseIndex<SearchItem>;
};

export const SearchBar = ({ items, index }: Props): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const fuse = useMemo(() => {
    return new Fuse(
      items,
      {
        // has to match fairly closely
        threshold: 0.2,
        // but can be anywhere in the string
        ignoreLocation: true,
      },
      Fuse.parseIndex(index),
    );
  }, []);
  const results = useMemo(() => fuse.search(searchTerm), [fuse, searchTerm]);

  return (
    <>
      <div className="my-3 flex">
        <input
          id="search-box"
          autoFocus
          className="w-full rounded-sm bg-zinc-200 p-2 text-lg dark:bg-zinc-500"
          type="text"
          value={searchTerm}
          placeholder="🔍 Enter a title or person..."
          onInput={(e) => {
            setSearchTerm((e.target as HTMLInputElement).value);
          }}
        />
        <button
          className={[
            "my-1",
            "ml-4",
            "rounded-sm",
            "px-3",
            "ring-1",
            "ring-zinc-500",
            "hover:bg-zinc-200",
            "dark:ring-white",
            "dark:hover:bg-zinc-700",
          ].join(" ")}
          onClick={() => {
            setSearchTerm("");
            document.getElementById("search-box")?.focus();
          }}
        >
          ❌
        </button>
      </div>

      {results.map(({ item }) => (
        <SearchResult key={item.permalink} {...item}></SearchResult>
      ))}
    </>
  );
};
