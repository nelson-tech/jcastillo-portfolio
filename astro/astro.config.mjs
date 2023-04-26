import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3333,
    host: true
  },
  integrations: [tailwind(), svelte()],
  output: "server",
  adapter: node({
    mode: "standalone"
  })
});