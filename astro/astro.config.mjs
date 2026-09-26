import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import node from "@astrojs/node";

// Vercel sets VERCEL=1 during builds: prerender every page there. The Docker deploy keeps SSR.
const onVercel = Boolean(process.env.VERCEL);

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3333,
    host: true,
  },
  integrations: [tailwind(), svelte()],
  output: onVercel ? "static" : "server",
  adapter: onVercel ? undefined : node({ mode: "standalone" }),
  vite: {
    server: {
      // Vite only skips folders named node_modules; the real deps live in node_modules.nosync.
      watch: { ignored: ["**/node_modules.nosync/**"] },
    },
  },
});
