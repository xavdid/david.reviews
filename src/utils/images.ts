import type { AbsoluteUrl, RelativeUrl } from "../airtable/types";

export type ImageInfo = {
  url: AbsoluteUrl | RelativeUrl;
  height: number;
  width: number;
  // https://en.wikipedia.org/wiki/Media_type#Common_examples
  // pulled from the way astro loads images
  type: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif";
};
