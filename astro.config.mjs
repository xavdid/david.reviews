import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: "https://david.reviews",
  integrations: [
    preact(),
    sitemap(),
    mdx({
      rehypePlugins: [
        // the IDs get generated without this, but the autolinking doesn't work?
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              // passed as a prop to OmniLink
              isHeading: true,
            },
          },
        ],
      ],
    }),
  ],

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

  vite: {
    server: {
      allowedHosts: ["xavdid.ngrok.io"],
    },
    plugins: [tailwindcss()],
  },
});
