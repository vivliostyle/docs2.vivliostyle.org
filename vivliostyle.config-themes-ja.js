import { getCopyAssetExcludes, transformSectionList, transformDocumentList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Themes ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'ja/themes/index.html',
    'ja/themes/official/index.html',
    'ja/themes/gallery/index.html',
    'ja/themes/spec/index.html',
    'ja/themes/development/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-themes-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-themes-ja.epub', format: 'epub' },
    { path: 'public/publications/themes-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/themes-ja',
  toc: { sectionDepth: 3, transformSectionList, transformDocumentList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'themes', lang: 'ja' }),
  },
};
