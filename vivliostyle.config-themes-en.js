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
  output: [
    { path: 'public/downloads/vivliostyle-themes-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-themes-en.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
};
