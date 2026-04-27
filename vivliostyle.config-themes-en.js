import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Themes Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: [
    'dist/en/themes/index.html',
    'dist/en/themes/official/index.html',
    'dist/en/themes/gallery/index.html',
    'dist/en/themes/spec/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-themes-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-themes-en.epub', format: 'epub' },
    { path: 'public/publications/themes-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'themes', lang: 'en' }),
  },
};
