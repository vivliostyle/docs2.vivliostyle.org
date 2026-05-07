import { getCopyAssetExcludes, transformSectionList } from './vivliostyle.config-shared.js';

export default {
  title: 'VFM (Vivliostyle Flavored Markdown) ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    'ja/vfm/index.html',
    'ja/vfm/vfm/index.html',
    'ja/vfm/hooks/index.html',
  ],
  output: [
    { path: 'public/downloads/vfm-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vfm-ja.epub', format: 'epub' },
    { path: 'public/publications/vfm-ja', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/vfm-ja',
  toc: { sectionDepth: 3, transformSectionList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'vfm', lang: 'ja' }),
  },
};
