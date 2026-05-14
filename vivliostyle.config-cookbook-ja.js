import { getCopyAssetExcludes, transformSectionList, transformDocumentList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle 活用ガイド',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'ja/cookbook/index.html',
    'ja/cookbook/footnotes/index.html',
    'ja/cookbook/cmyk/index.html',
    'ja/cookbook/page-groups/index.html',
    'ja/cookbook/vfm-extensions/index.html',
    'ja/cookbook/responsive-and-nesting/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-cookbook-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-cookbook-ja.epub', format: 'epub' },
    { path: 'public/publications/cookbook-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/cookbook-ja',
  toc: { sectionDepth: 3, transformSectionList, transformDocumentList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cookbook', lang: 'ja' }),
  },
};
