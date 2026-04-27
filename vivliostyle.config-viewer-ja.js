import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Viewer ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: ['dist/ja/viewer/vivliostyle-viewer/index.html'],
  output: [
    { path: 'public/downloads/vivliostyle-viewer-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-viewer-ja.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'viewer', lang: 'ja' }),
  },
};
