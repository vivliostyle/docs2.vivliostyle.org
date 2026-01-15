export default {
  title: 'Vivliostyle Reference',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-docs',
  entry: [
    'dist/en/reference/index.html',
    'dist/en/reference/contribution-guide/index.html',
    'dist/en/reference/contributing-cli/index.html',
    'dist/en/reference/contributing-vfm/index.html',
    'dist/en/reference/contributing-themes/index.html',
    'dist/en/reference/api/index.html',
    'dist/en/reference/supported-css-features/index.html',
  ],
  output: 'public/downloads/vivliostyle-reference-en.pdf',
  workspaceDir: '.vivliostyle',
  toc: true,
};
