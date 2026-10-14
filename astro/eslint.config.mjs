import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import svelte from "eslint-plugin-svelte";
import commentRules from "./eslint-rules/comment-rules.mjs";

// Comment hygiene only (same rules as Roy and Sensational Concrete):
// suppressions need a reason, warning markers need an issue instead, and
// history lives in git.
export default [
  { ignores: ["dist/**", "node_modules/**", "public/**", ".astro/**", ".vercel/**"] },
  ...astro.configs.base,
  ...svelte.configs.base,
  {
    files: ["**/*.svelte"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}", "**/*.astro", "**/*.svelte"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    plugins: { "@typescript-eslint": tseslint.plugin, comments: commentRules },
    rules: {
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        "ts-nocheck": true,
        "ts-check": false,
        minimumDescriptionLength: 10,
      }],
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack", "workaround"], location: "anywhere" }],
      "comments/no-history-comments": "error",
    },
  },
];
