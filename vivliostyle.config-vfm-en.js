import { getCopyAssetExcludes, transformSectionList, transformDocumentList } from './vivliostyle.config-shared.js';

export default {
  title: 'VFM (Vivliostyle Flavored Markdown) Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
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
  toc: { sectionDepth: 3, transformSectionList, transformDocumentList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'vfm', lang: 'en' }),
  },
};
