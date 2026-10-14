/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}",
    require("path").join(
      require.resolve("@skeletonlabs/skeleton"),
      "../**/*.{html,js,svelte,ts}"
    ),
  ],
  theme: {
    extend: {
      colors: {
        highlight: "#5592b5",
        // Same hue as highlight, darkened just enough for 4.5:1 body-size text on paper.
        "highlight-text": "#407594",
        ink: "#16191C",
        paper: "#F5F3EE",
        stone: "#6B7176",
        rule: "#DEDAD2",
        "accent-deep": "#2E6584",
      },
      fontFamily: {
        sans: ["basic-sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [...require("@skeletonlabs/skeleton/tailwind/skeleton.cjs")()],
};
