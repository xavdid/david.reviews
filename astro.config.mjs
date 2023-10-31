import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  image: {
    remotePatterns: [
      // these are intentionally commented out
      // I think the compression crushes the quality too much
      // {
      //   protocol: "https",
      //   hostname: "*.airtableusercontent.com",
      // },
      // {
      //   protocol: "https",
      //   hostname: "image.tmdb.org",
      // },
    ],
  },
});
