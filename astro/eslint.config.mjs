import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import svelte from "eslint-plugin-svelte";
import commentRules from "./eslint-rules/comment-rules.mjs";
import testRules from "./eslint-rules/test-rules.mjs";

// Comment hygiene only (same rules as Roy and Sensational Concrete):
// suppressions need a reason, warning markers need an issue instead, and
// history lives in git.
export default [
  {
    // Tautological tests (assert a constant, compare a value with itself, or
    // mock the module the file is named after) pass forever and catch nothing.
    files: ["**/*.{test,spec}.{js,mjs,cjs,ts,tsx}", "**/test/**/*.{js,mjs,cjs,ts,tsx}", "**/tests/**/*.{js,mjs,cjs,ts,tsx}", "**/tests-int/**/*.{js,mjs,cjs,ts,tsx}", "e2e/**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { tests: testRules },
    rules: {
      "tests/no-constant-assertion": "error",
      "tests/no-mock-unit-under-test": "error",
    },
  },
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
