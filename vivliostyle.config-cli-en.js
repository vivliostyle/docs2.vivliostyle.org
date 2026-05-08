import { getCopyAssetExcludes, transformSectionList, transformDocumentList } from './vivliostyle.config-shared.js';

export default {
  title: 'Vivliostyle CLI Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-PDF',
  entryContext: 'dist',
  entry: [
    // en/cli/index.html is omitted from PDF/EPUB because its content
    // duplicates the auto-generated table of contents (toc: true).
    // The page remains available on the Web build.
    'en/cli/getting-started/index.html',
    'en/cli/using-config-file/index.html',
    'en/cli/config/index.html',
    'en/cli/themes-and-css/index.html',
    'en/cli/cover-page/index.html',
    'en/cli/toc-page/index.html',
    'en/cli/special-output-settings/index.html',
    'en/cli/frontend-framework-support/index.html',
    'en/cli/api-javascript/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-cli-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-cli-en.epub', format: 'epub' },
    { path: 'public/publications/cli-en', format: 'webpub' },
  ],
  workspaceDir: '.vivliostyle/cli-en',
  toc: { sectionDepth: 3, transformSectionList, transformDocumentList },
  copyAsset: {
    excludes: getCopyAssetExcludes({ product: 'cli', lang: 'en' }),
  },
};
