module.exports = {
  root: true,
  // don't lint this file
  // https://typescript-eslint.io/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
  ignorePatterns: [".eslintrc.cjs"],
  extends: ["@xavdid", "plugin:astro/recommended"],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    // all astro components are untyped, so I'm getting a lot of complaints about this
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
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
