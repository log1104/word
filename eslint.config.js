import astroPlugin from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";

export default [
  // add more generic rules here
  ...astroPlugin.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // "@typescript-eslint/no-unused-vars": "error"
    }
  }
];
