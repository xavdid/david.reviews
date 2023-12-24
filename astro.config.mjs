import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://david.reviews",
  integrations: [tailwind(), preact()],
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
