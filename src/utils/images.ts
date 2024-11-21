import type { ExternalUrl } from "../airtable/types";

export type ImageInfo = {
  url: ExternalUrl;
  height: number;
  width: number;
  // https://en.wikipedia.org/wiki/Media_type#Common_examples
  // pulled from the way astro loads images
  type: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif";
};
