import Fuse, { type FuseIndex } from "fuse.js/min-basic";
import { useMemo, useState } from "react";
import { type SearchItem } from "../utils";
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
        threshold: 0.4,
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
          className="w-full rounded bg-zinc-200 p-2 text-lg dark:bg-zinc-500"
          type="text"
          value={searchTerm}
          placeholder="🔍 Enter a title or person..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        <button
          className="my-1 ml-4 rounded  px-3 ring-1  ring-zinc-500 hover:bg-zinc-200 dark:ring-white dark:hover:bg-slate-700"
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
