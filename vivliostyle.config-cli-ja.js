import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle CLI ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'ja/cli/index.html',
    'ja/cli/getting-started/index.html',
    'ja/cli/using-config-file/index.html',
    'ja/cli/config/index.html',
    'ja/cli/themes-and-css/index.html',
    'ja/cli/cover-page/index.html',
    'ja/cli/toc-page/index.html',
    'ja/cli/special-output-settings/index.html',
    'ja/cli/frontend-framework-support/index.html',
    'ja/cli/api-javascript/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-cli-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-cli-ja.epub', format: 'epub' },
    { path: 'public/publications/cli-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/cli-ja',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cli', lang: 'ja' }),
  },
};
