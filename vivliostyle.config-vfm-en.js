import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'VFM (Vivliostyle Flavored Markdown) Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entry: [
    'dist/en/vfm/index.html',
    'dist/en/vfm/vfm/index.html',
    'dist/en/vfm/hooks/index.html',
  ],
  output: [
    { path: 'public/downloads/vfm-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vfm-en.epub', format: 'epub' },
    { path: 'public/publications/vfm-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'vfm', lang: 'en' }),
  },
};
