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
    'en/reference/contribution-guide/index.html',
    'en/reference/contributing-cli/index.html',
    'en/reference/contributing-vfm/index.html',
    'en/reference/contributing-themes/index.html',
    'en/reference/api/index.html',
    'en/reference/supported-css-features/index.html',
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
