import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import astro from "eslint-plugin-astro";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", ".astro/", "eslint.config.js"] },

  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  astro.configs.recommended,
  eslintConfigPrettier,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // https://typescript-eslint.io/rules/no-unused-vars/#what-benefits-does-this-rule-have-over-typescript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
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
  },
);
