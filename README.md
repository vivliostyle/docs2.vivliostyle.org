
# Vivliostyle Documentation Site

This repository contains the source for the next-generation official documentation site for [Vivliostyle](https://vivliostyle.org/).

## Overview

- Static site generation with Astro + VFM (Vivliostyle Flavored Markdown)
- CSS supporting SSMO (Single Source Multi Output)
- Multilingual content (Japanese and English)
- Automated deployment with GitHub Actions (GitHub Pages)

## Main Technologies

- [Astro](https://astro.build/) v5
- [@vivliostyle/vfm](https://github.com/vivliostyle/vfm) (Markdown → HTML conversion)
- [gray-matter](https://github.com/jonschlinkert/gray-matter) (frontmatter parsing)

## Directory Structure

```
/
├── content/           # Documentation content (Markdown)
│   ├── en/
│   └── ja/
├── public/            # Static assets served as-is
│   ├── styles/
│   ├── themes/
│   ├── vfm/
│   └── viewer/
├── src/               # Astro source (components, pages, styles, etc.)
│   ├── components/
│   ├── layouts/
│   ├── loaders/
│   ├── pages/
│   └── styles/
├── _investigation/    # Investigation notes and planning docs
├── packages/          # Local packages
├── submodules/        # Git submodules
├── .github/workflows/ # CI/CD workflows
├── astro.config.mjs
├── tsconfig.json
├── vivliostyle.config-*.js
└── package.json
```

## Development, Build, and Deploy

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `npm install`         | Install dependencies                              |
| `npm run dev`         | Start the dev server (http://localhost:4321)      |
| `npm run build`       | Build the static site into `./dist/`              |
| `npm run preview`     | Preview the build output locally                  |

Deployment is triggered automatically via GitHub Actions when you push to the `astro-Install`/`main` branch.

Published URL: https://docs.vivliostyle.org/


## Contributing / References

- [Vivliostyle Official Website](https://vivliostyle.org/)
- [Astro Documentation](https://docs.astro.build)
- [VFM (Vivliostyle Flavored Markdown)](https://github.com/vivliostyle/vfm)


## License

This repository is licensed under the [0BSD license](LICENSE), except for the files listed below, which remain under their original licenses.

| Files | Origin | License |
|---|---|---|
| `public/viewer/assets/` | [vivliostyle.js](https://github.com/vivliostyle/vivliostyle.js) | AGPL-3.0 |
| `public/themes/assets/` | [themes](https://github.com/vivliostyle/themes) | Apache-2.0 |
| `public/vfm/assets/ecosystem.drawio.svg` | [VFM](https://github.com/vivliostyle/vfm) | Apache-2.0 |
| `public/vivliostyle-logo72.png`, `public/favicon.*`, `public/vivliostyle-docs.*` | [Vivliostyle logo](https://vivliostyle.org/logo/) | MIT |
| `packages/theme-PDF/fonts/` | See [`fonts/README.md`](packages/theme-PDF/fonts/README.md) | SIL OFL 1.1, Apache-2.0 + CC BY 4.0 |

The documents under `submodules/`, which are loaded at build time, are licensed by their respective upstream repositories.
