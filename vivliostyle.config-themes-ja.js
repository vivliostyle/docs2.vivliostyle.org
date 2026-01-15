export default {
  title: 'Vivliostyle Themes ドキュメント',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-docs',
  entry: [
    'dist/ja/themes/index.html',
    'dist/ja/themes/official/index.html',
    'dist/ja/themes/gallery/index.html',
    'dist/ja/themes/spec/index.html',
    'dist/ja/themes/development/index.html',
  ],
  output: 'public/downloads/vivliostyle-themes-ja.pdf',
  workspaceDir: '.vivliostyle',
  toc: true,
};
