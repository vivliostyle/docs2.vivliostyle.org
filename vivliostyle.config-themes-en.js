import { getCopyAssetExcludes, transformSectionList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Themes Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'en/themes/index.html',
    'en/themes/official/index.html',
    'en/themes/gallery/index.html',
    'en/themes/spec/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-themes-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-themes-en.epub', format: 'epub' },
    { path: 'public/publications/themes-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/themes-en',
  toc: { sectionDepth: 3, transformSectionList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'themes', lang: 'en' }),
  },
};
