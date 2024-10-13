/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/** @type {import('tailwindcss').Config} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { blue, red, emerald, purple } = require("tailwindcss/colors");

// this is a JS file
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const insetShadow = (color) => `inset 0em -0.2em ${color["600"]}`;
// black/white hover bar
const insetInfo = `inset 0em -0.2em black`;
const insetInfoDark = `inset 0em -0.2em white`;

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      boxShadow: {
        // have to pre-declare these since I can't build them dynamically
        // https://tailwindcss.com/docs/content-configuration#dynamic-class-names
        insetGame: insetShadow(blue),
        insetMovie: insetShadow(red),
        insetBook: insetShadow(emerald),
        insetArticles: insetShadow(purple),
        insetInfo,
        insetInfoDark,
      },
      typography: {
        DEFAULT: {
          css: {
            blockquote: {
              // disalbe quotes befor and after text
              quotes: "none",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
