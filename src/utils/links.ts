// top level routes with subpaths that should be subtle
const subtleRoutes = ["articles", "rating"];

// certain subsegments are informational, not grouped
const subtleSubroutes = [
  "years",
  "recommended",
  "all",
  "awarded",
  "unrecommended",
  "rating",
];

export const linkMode = (href: string): "subtle" | "rounded" | "external" => {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto") ||
    href.endsWith(".png")
  ) {
    return "external";
  }

  // get rid of any anchors
  href = href.split("#")[0];

  let segments = href
    .split("/")
    // ignore anchors for styling purposes
    .filter((s) => !s.startsWith("#"));

  if (segments.at(-1) !== "") {
    throw new Error(
      `Internal link "${href}" doesn't end with a trailing slash!`,
    );
  }

  segments = segments
    // ignore leading/trailing slashes
    .filter(Boolean);

  // top-level pages are subtle
  if (segments.length <= 1) {
    return "subtle";
  }

  if (
    subtleRoutes.includes(segments[0]) ||
    subtleSubroutes.includes(segments[1])
  ) {
    return "subtle";
  }

  return "rounded";
};
