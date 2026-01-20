export default {
  title: 'VFM (Vivliostyle Flavored Markdown) Documentation',
  author: 'Vivliostyle Foundation',
  language: 'en',
  size: 'A4',
  theme: '@vivliostyle/theme-techbook',
  entry: [
    'dist/en/vfm/index.html',
    'dist/en/vfm/vfm/index.html',
    'dist/en/vfm/hooks/index.html',
  ],
  output: 'public/downloads/vfm-en.pdf',
  workspaceDir: '.vivliostyle',
  toc: true,
};
