// certain subsegments are informational, not grouped
const subtleSubroutes = [
  "years",
  "recommended",
  "all",
  "awarded",
  "unrecommended",
];

export const linkMode = (href: string): "subtle" | "rounded" | "external" => {
  if (href.startsWith("http")) {
    return "external";
  }

  if (href.startsWith("/articles")) {
    return "subtle";
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

  if (subtleSubroutes.includes(segments[1])) {
    return "subtle";
  }

  return "rounded";
};
