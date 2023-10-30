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
      colors: {
        // .orange {
        // 	color: #ff9700;
        // }

        // .blue {
        // 	color: #0f89ff;
        // }

        // .purple {
        // 	color: #930eff;
        // }

        // .darkgreen {
        // 	color: #68c800;
        // }
        game: {
          500: "#0f89ff",
        },
        movie: {
          500: "#ff9700",
        },
        book: {
          500: "#930eff",
        },
      },
    },
  },
  plugins: [],
};
