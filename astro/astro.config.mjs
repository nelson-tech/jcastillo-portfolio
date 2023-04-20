import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3333,
    host: true
  },
  integrations: [tailwind(), svelte()]
});