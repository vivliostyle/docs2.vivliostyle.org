---
title: Changelog
description: Update history for the Vivliostyle documentation site — the versions of the documentation it carries, and changes to the site itself
lang: en
order: 1
---

# Changelog

Update history for this site, newest first: the versions of the documentation pulled in from the upstream repositories, and changes to the site itself.

## September 15, 2026

Updated the documentation carried here to Vivliostyle.js v2.45.1 / Vivliostyle CLI v11.3.3 / Vivliostyle Themes v3 (theme-base 3.0.0) / VFM 2.7.2. Versions in parentheses are the releases each feature landed in.

- **[Vivliostyle Themes](/en/themes/) v3** — A major change to how themes are written. Adds a [migration guide](/en/themes/migration-v3/) with step-by-step instructions and the full variable rename tables. In [Using Themes](/en/themes/usage/), the presets (`theme-all.css` and friends) give way to a [Package Entry and Modules](/en/themes/usage/#package-entry-and-modules) section. [Developing Themes](/en/themes/development/) and the [spec](/en/themes/spec/) now reflect that scaffolding and validation moved to the CLI's `vivliostyle theme create` and `vivliostyle theme validate`.
- **[Vivliostyle CLI](/en/cli/) v11.3.3** — Adds sections on [importing themes from CSS](/en/cli/themes-and-css/#importing-themes-from-css) by npm package name, e.g. `@import '@vivliostyle/theme-base';` (v11.3.0), [using PostCSS](/en/cli/themes-and-css/#using-postcss) (v11.3.0), and [creating a theme](/en/cli/themes-and-css/#creating-a-theme) (v11.3.0). The config reference gains [`css.postcss`](/en/cli/config/#cssconfig) (v11.3.0) and `cmyk.fallback` for colours the regular mapping does not reach, which deprecates `cmyk.overrideMap` (v11.3.0). [Templates](/en/cli/templates/) now warns that template variables are inserted unescaped, so values placed inside string literals should be wrapped in the `json` helper.
- **[Vivliostyle Viewer / Core](/en/viewer/) v2.45.1** — A bug-fix-only release; supported CSS features are unchanged.
- **[Awesome Vivliostyle](/en/reference/awesome-vivliostyle/)** — Adds three more Gijutsu-Hyohron titles to the list of books made with Vivliostyle.

## August 24, 2026

Updated the documentation carried here to Vivliostyle.js v2.45.0 / Vivliostyle CLI v11.2.0 / VFM 2.7.2 / theme-base 2.1.1. Versions in parentheses are the releases each feature landed in.

- **[Vivliostyle Viewer / Core](/en/viewer/) v2.45.0** — Supported CSS features now cover [CSS Cascade Layers (`@layer`)](/en/reference/supported-css-features/#css-cascading-and-inheritance-5) (v2.45.0) and the [`revert-layer` and `revert-rule` keywords](/en/reference/supported-css-features/#values) that roll the cascade back (v2.45.0). Coverage of existing features also caught up: a [CSS Nesting](/en/reference/supported-css-features/#css-nesting-1) section (v2.42.0), and [`attr()`](/en/reference/supported-css-features/#values) working on properties other than `content` with type and unit specifications (v2.43.0).
- **[Vivliostyle CLI](/en/cli/) v11.2.0** — Adds the [`toc.compose` option](/en/cli/config/#tocconfig) for composing the contents of the ToC navigation element (v11.2.0). Also reflects that [`renderMode: docker`](/en/cli/special-output-settings/#generating-with-docker) is deprecated (v11.0.3), that [project creation](/en/cli/getting-started/#creating-a-vivliostyle-project) uses `npm create book@latest` (v11.0.0), and that Node.js v22.12.0 or later is required (v11.0.1).
- **[VFM](/en/vfm/) 2.7.2** — Documentation caught up with the options added in the 2.7 line: the [math renderer](/en/vfm/vfm/#math-renderer) (2.7.1; `mathml` converts LaTeX to MathML at build time, with no runtime script), [captionless image policy](/en/vfm/vfm/#captionless-image-policy) (2.7.0), [rewriting relative href extensions](/en/vfm/vfm/#rewrite-relative-href-extensions) (2.7.1), [table cell alignment](/en/vfm/vfm/#cell-alignment-output) (2.7.1), and [footnote modes](/en/vfm/vfm/#footnote-mode). Adds a [Plugin options](/en/vfm/plugin-options/) page and covers [`editPlugins`](/en/vfm/hooks/#edit-plugins) (2.7.0) for editing the plugin lists VFM assembles.
- **[Vivliostyle Themes](/en/themes/) theme-base 2.1.1** — Updated the [usage](/en/themes/usage/) and [development](/en/themes/development/) guides.

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
