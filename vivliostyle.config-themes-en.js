export default {
  title: 'Vivliostyle Themes Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: './packages/theme-docs',
  entry: [
    'dist/en/themes/index.html',
    'dist/en/themes/official/index.html',
    'dist/en/themes/gallery/index.html',
    'dist/en/themes/spec/index.html',
  ],
  output: 'public/downloads/vivliostyle-themes-en.pdf',
  workspaceDir: '.vivliostyle',
  toc: true,
};
