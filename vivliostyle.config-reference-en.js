import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Reference',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'en/reference/index.html',
    'en/reference/supported-css-features/index.html',
    'en/reference/api/index.html',
    'en/reference/contribution-guide/index.html',
    'en/reference/contribution-guide/js/index.html',
    'en/reference/contribution-guide/cli/index.html',
    'en/reference/contribution-guide/vfm/index.html',
    'en/reference/contribution-guide/themes/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-reference-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-reference-en.epub', format: 'epub' },
    { path: 'public/publications/reference-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/reference-en',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'reference', lang: 'en' }),
  },
};
