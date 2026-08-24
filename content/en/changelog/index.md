---
title: Changelog
description: Update history for the Vivliostyle documentation site — the versions of the documentation it carries, and changes to the site itself
lang: en
order: 1
---

# Changelog

Update history for this site, newest first: the versions of the documentation pulled in from the upstream repositories, and changes to the site itself.

## August 24, 2026

- **[Vivliostyle Viewer / Core](/en/viewer/) v2.45.0** — The [`revert-layer` and `revert-rule` keywords](/en/reference/supported-css-features/#values) roll the cascade back, and the docs now state that they also work in `@page` rules, page margin boxes, and custom properties.
- **[Vivliostyle CLI](/en/cli/) v11.2.0** — Bundles Vivliostyle.js 2.45.0 for CSS Cascade Layers support. No changes to the documentation itself.

## August 19, 2026

- **[Vivliostyle Viewer / Core](/en/viewer/) v2.44.1** — Supported CSS features now cover [CSS Cascade Layers (`@layer`)](/en/reference/supported-css-features/#css-cascading-and-inheritance-5) and [CSS Nesting](/en/reference/supported-css-features/#css-nesting-1). [`attr()`](/en/reference/supported-css-features/#values) works on properties other than `content` and accepts type and unit specifications.
- **[Vivliostyle CLI](/en/cli/) v11.1.0** — Adds the [`toc.compose` option](/en/cli/config/#tocconfig) for composing the contents of the ToC navigation element. [`renderMode: docker`](/en/cli/special-output-settings/#generating-with-docker) is now deprecated. [Project creation](/en/cli/getting-started/#creating-a-vivliostyle-project) now uses `npm create book@latest`, and Node.js v22.12.0 or later is required.
- **[VFM](/en/vfm/) v2.7.2** — Documents the options added in v2.7: the [math renderer](/en/vfm/vfm/#math-renderer) (`mathml` converts LaTeX to MathML at build time, with no runtime script), [captionless image policy](/en/vfm/vfm/#captionless-image-policy), [rewriting relative href extensions](/en/vfm/vfm/#rewrite-relative-href-extensions), [table cell alignment](/en/vfm/vfm/#cell-alignment-output), and [footnote modes](/en/vfm/vfm/#footnote-mode). Adds a [Plugin options](/en/vfm/plugin-options/) page and covers [`editPlugins`](/en/vfm/hooks/#edit-plugins) for editing the plugin lists VFM assembles.
- **[Vivliostyle Themes](/en/themes/) theme-base v2.1.1** — theme-base stylesheets are now flat under `css/`. The [`@import` examples](/en/themes/usage/#using-theme-base-directly) and the [module list](/en/themes/development/#using-theme-base-modules) were updated (`css/common/reset.css` → `css/reset.css`, `meta-properties.css` → `define.css`).

## May 29, 2026

- Updated the documentation carried here to Vivliostyle.js v2.42.1 / Vivliostyle CLI 10.6.0 / VFM 2.7.0.
- Added the [CSS Nesting guide](/en/cookbook/css-nesting/) to the Cookbook.

## May 21, 2026

- Added the [Cookbook](/en/cookbook/) with three guides: [Footnotes](/en/cookbook/footnotes/), [CMYK Conversion](/en/cookbook/cmyk/), and [Page Groups](/en/cookbook/page-groups/).

## May 8, 2026

- Started publishing PDF, EPUB and WebPub editions. Each document is built with Vivliostyle CLI and can be downloaded from the [top page](/en/).

## April 21, 2026

- Updated the Vivliostyle Themes documentation.

## April 14, 2026

- Updated the documentation carried here to Vivliostyle.js v2.41.0 / Vivliostyle CLI 10.5.0 / VFM 2.6.0.

## February 27, 2026

- Added [Awesome Vivliostyle](/en/reference/awesome-vivliostyle/) to the Reference section.

## February 16, 2026

- Redesigned the site header.

## February 2, 2026

- Added automatic redirection based on the browser's language setting.

## January 14, 2026

- Integrated the Vivliostyle Themes, VFM and Vivliostyle.js documentation and added the [Reference](/en/reference/) section. Versions carried: Vivliostyle.js 2.40.0 / Vivliostyle CLI 10.3.0 / VFM 2.5.0 / theme-academic 2.0.1.

## January 8, 2026

- Integrated the [Vivliostyle CLI](/en/cli/) documentation (10.2.1), with English/Japanese language switching.
