import { getCopyAssetExcludes, transformSectionList, transformDocumentList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle Cookbook',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'en/cookbook/index.html',
    'en/cookbook/footnotes/index.html',
    'en/cookbook/cmyk/index.html',
    'en/cookbook/page-groups/index.html',
    'en/cookbook/vfm-extensions/index.html',
    'en/cookbook/responsive-and-nesting/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-cookbook-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-cookbook-en.epub', format: 'epub' },
    { path: 'public/publications/cookbook-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/cookbook-en',
  toc: { sectionDepth: 3, transformSectionList, transformDocumentList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cookbook', lang: 'en' }),
  },
};
