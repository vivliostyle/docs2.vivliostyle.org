// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs2.vivliostyle.org',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      noExternal: ['@vivliostyle/vfm'],
    },
  },
  trailingSlash: 'always',
});

