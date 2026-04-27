export default {
  title: 'VFM (Vivliostyle Flavored Markdown) ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entry: [
    'dist/ja/vfm/index.html',
    'dist/ja/vfm/vfm/index.html',
    'dist/ja/vfm/hooks/index.html',
  ],
  output: [
    { path: 'public/downloads/vfm-ja.pdf', format: 'pdf' },
    { path: 'public/downloads/vfm-ja.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
};
