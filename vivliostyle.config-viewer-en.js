import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Viewer Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entryContext: 'dist',
  entry: [
    'en/viewer/vivliostyle-viewer/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-viewer-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-viewer-en.epub', format: 'epub' },
    { path: 'public/publications/viewer-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/viewer-en',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'viewer', lang: 'en' }),
  },
};
