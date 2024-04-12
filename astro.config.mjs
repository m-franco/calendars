import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://m-franco.github.io',
  base: 'calendars',
  integrations: [tailwind()]
});