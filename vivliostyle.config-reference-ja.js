export default {
  title: 'Vivliostyle リファレンス',
  author: 'Vivliostyle Foundation',
  language: 'ja',
  size: 'A4',
  theme: './packages/theme-docs',
  entry: [
    'dist/ja/reference/index.html',
    'dist/ja/reference/contribution-guide/index.html',
    'dist/ja/reference/contributing-cli/index.html',
    'dist/ja/reference/contributing-vfm/index.html',
    'dist/ja/reference/contributing-themes/index.html',
    'dist/ja/reference/api/index.html',
    'dist/ja/reference/supported-css-features/index.html',
  ],
  output: 'public/downloads/vivliostyle-reference-ja.pdf',
  workspaceDir: '.vivliostyle',
  toc: true,
};
