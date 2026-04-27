import { getCopyAssetExcludes } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Reference',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entry: [
    'dist/en/reference/index.html',
    'dist/en/reference/contribution-guide/index.html',
    'dist/en/reference/contributing-cli/index.html',
    'dist/en/reference/contributing-vfm/index.html',
    'dist/en/reference/contributing-themes/index.html',
    'dist/en/reference/api/index.html',
    'dist/en/reference/supported-css-features/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-reference-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-reference-en.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'reference', lang: 'en' }),
  },
};
