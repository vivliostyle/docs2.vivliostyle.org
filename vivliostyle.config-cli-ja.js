import { getCopyAssetExcludes, transformSectionList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle CLI ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    // ja/cli/index.html は内容が論理目次と完全に重複するため、PDF/EPUB では
    // toc: true で生成される目次ページに任せて省略する（Web では引き続き表示）。
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
  toc: { sectionDepth: 3, transformSectionList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cli', lang: 'ja' }),
  },
};
