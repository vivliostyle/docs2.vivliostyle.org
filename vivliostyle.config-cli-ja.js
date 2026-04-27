import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle CLI ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: [
    'dist/ja/cli/index.html',
    'dist/ja/cli/getting-started/index.html',
    'dist/ja/cli/using-config-file/index.html',
    'dist/ja/cli/config/index.html',
    'dist/ja/cli/themes-and-css/index.html',
    'dist/ja/cli/cover-page/index.html',
    'dist/ja/cli/toc-page/index.html',
    'dist/ja/cli/special-output-settings/index.html',
    'dist/ja/cli/frontend-framework-support/index.html',
    'dist/ja/cli/api-javascript/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-cli-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-cli-ja.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cli', lang: 'ja' }),
  },
};
