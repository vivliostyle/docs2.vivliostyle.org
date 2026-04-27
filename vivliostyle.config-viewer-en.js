export default {
  title: 'Vivliostyle Viewer Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entry: [
    'dist/en/viewer/vivliostyle-viewer/index.html',
  ],
  output: [
    { path: 'public/downloads/vivliostyle-viewer-en.pdf', format: 'pdf' },
    { path: 'public/downloads/vivliostyle-viewer-en.epub', format: 'epub' },
  ],
  workspaceDir: '.vivliostyle',
  toc: true,
};
