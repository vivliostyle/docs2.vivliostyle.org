// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.vivliostyle.org',
  output: 'static',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      noExternal: ['@vivliostyle/vfm'],
    },
    resolve: {
      alias: {
        // 開発環境ではPagefindを無効化
        '/_pagefind/pagefind-ui.js': process.env.NODE_ENV === 'production' 
          ? '/_pagefind/pagefind-ui.js' 
          : 'data:text/javascript,export const PagefindUI = class { constructor() {} }',
      },
    },
    build: {
      rollupOptions: {
        external: ['/_pagefind/pagefind-ui.js'],
      },
    },
  },
  trailingSlash: 'always',
});

