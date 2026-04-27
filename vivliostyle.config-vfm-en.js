import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'VFM (Vivliostyle Flavored Markdown) Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entryContext: 'dist',
  entry: [
    'en/vfm/index.html',
    'en/vfm/vfm/index.html',
    'en/vfm/hooks/index.html',
  ],
  output: [
    { path: 'public/downloads/vfm-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vfm-en.epub', format: 'epub' },
    { path: 'public/publications/vfm-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/vfm-en',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'vfm', lang: 'en' }),
  },
};
