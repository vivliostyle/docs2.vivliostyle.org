import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle リファレンス',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: [
    'dist/ja/reference/index.html',
    'dist/ja/reference/contribution-guide/index.html',
    'dist/ja/reference/contributing-cli/index.html',
    'dist/ja/reference/contributing-vfm/index.html',
    'dist/ja/reference/contributing-themes/index.html',
    'dist/ja/reference/api/index.html',
    'dist/ja/reference/supported-css-features/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-reference-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-reference-ja.epub', format: 'epub' },
    { path: 'public/publications/reference-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'reference', lang: 'ja' }),
  },
};
