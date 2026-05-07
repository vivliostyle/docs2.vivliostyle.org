import { getCopyAssetExcludes, transformSectionList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Viewer ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: ['ja/viewer/vivliostyle-viewer/index.html'],
  output: [
    { path: 'public/downloads/vivliostyle-viewer-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-viewer-ja.epub', format: 'epub' },
    { path: 'public/publications/viewer-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/viewer-ja',
  toc: { sectionDepth: 3, transformSectionList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'viewer', lang: 'ja' }),
  },
};
