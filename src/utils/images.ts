import type { ExternalUrl } from "../airtable/types";

export type ImageInfo = {
  url: ExternalUrl;
  height: number;
  width: number;
  // https://en.wikipedia.org/wiki/Media_type#Common_examples
  type: "png" | "jpeg";
};
