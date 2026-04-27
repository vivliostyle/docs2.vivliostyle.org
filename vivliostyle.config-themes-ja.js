import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Themes ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: [
    'dist/ja/themes/index.html',
    'dist/ja/themes/official/index.html',
    'dist/ja/themes/gallery/index.html',
    'dist/ja/themes/spec/index.html',
    'dist/ja/themes/development/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-themes-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-themes-ja.epub', format: 'epub' },
    { path: 'public/publications/themes-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'themes', lang: 'ja' }),
  },
};
