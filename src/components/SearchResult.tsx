import { type JSX } from "preact";

import type { SearchItem } from "../utils/search";
import { BookIcon, GameIcon, MovieIcon } from "./icons/inline-icons";

type Props = SearchItem;

const config: Record<
  SearchItem["category"],
  {
    icon: ({}: any) => JSX.Element;
    border: string;
  }
> = {
  game: { border: "border-blue-600", icon: GameIcon },
  movie: { border: "border-red-600", icon: MovieIcon },
  book: { border: "border-emerald-600", icon: BookIcon },
};

export const SearchResult = ({
  title,
  category,
  permalink,
}: Props): JSX.Element => {
  const { border, icon: Icon } = config[category];
  return (
    <a
      className={[
        "underline",
        "block",
        "rounded",
        "my-3",
        "p-2",
        "border-2",
        border,
        "even:bg-zinc-100",
        "hover:bg-zinc-300",
        "dark:even:bg-zinc-700",
        "dark:hover:bg-zinc-500",
      ].join(" ")}
      href={permalink}
    >
      <Icon />
      <span className="pl-1">{title}</span>
    </a>
  );
};
