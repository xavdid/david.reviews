/** @type {import('tailwindcss').Config} */

const { blue, red, emerald } = require("tailwindcss/colors");

const insetShadow = (color) => `inset 0em -0.2em ${color["600"]}`;

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
      },
    },
  },
  plugins: [],
};
