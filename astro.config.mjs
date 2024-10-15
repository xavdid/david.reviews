import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://david.reviews",
  integrations: [tailwind(), preact(), sitemap(), mdx()],
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
