module.exports = {
  root: true,
  // don't lint this file
  // https://typescript-eslint.io/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
  ignorePatterns: [".eslintrc.cjs"],
  extends: ["plugin:astro/recommended", "@xavdid"],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    // all astro components are untyped, so I'm getting a lot of complaints about this
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "astro:schema",
            importNames: ["undefined"],
            message:
              "This import is almost certainly in error. You use `undefined` directly unless you're describing a Zod schema.",
          },
          {
            name: "@sindresorhus/slugify",
            message:
              "Use slugify from `utils/data` instead, since that handles character markings like I want.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  ],
};
