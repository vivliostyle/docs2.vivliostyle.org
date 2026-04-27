import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle リファレンス',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'ja/reference/index.html',
    'ja/reference/contribution-guide/index.html',
    'ja/reference/contributing-cli/index.html',
    'ja/reference/contributing-vfm/index.html',
    'ja/reference/contributing-themes/index.html',
    'ja/reference/api/index.html',
    'ja/reference/supported-css-features/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-reference-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-reference-ja.epub', format: 'epub' },
    { path: 'public/publications/reference-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/reference-ja',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'reference', lang: 'ja' }),
  },
};
