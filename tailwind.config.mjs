/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/** @type {import('tailwindcss').Config} */

export default {
  theme: {
    extend: {
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
};
