---
title: Cookbook
description: Practical, feature-oriented guides to recent additions across Vivliostyle
lang: en
order: 1
---

# Cookbook

Practical, feature-oriented guides to recent additions across the Vivliostyle ecosystem. Each article focuses on **what you can do** and **how to use it** in real publishing workflows, rather than spec-level reference.

Each guide states the minimum version required at the top, so you can tell at a glance whether the feature is available in your environment.

## Guides

- **[Footnotes](./footnotes/)** — DPUB-ARIA footnote support, the standard `@page { @footnote { } }` rule, `footnote-display`, and the new VFM `footnote` modes (`pandoc` / `gcpm` / `dpub`).
  - Target: Vivliostyle.js v2.41.0+, CLI v10.5.0+

- **[CMYK Conversion](./cmyk/)** — The `device-cmyk()` CSS function and the CLI's PDF CMYK output (`pdfPostprocess.cmyk`).
  - Target: Vivliostyle.js v2.40.0+, CLI v10.5.0+

- **[Page Groups](./page-groups/)** — Named pages, the `:nth(An+B of C)` page selector, and per-chapter layouts.
  - Target: Vivliostyle.js v2.39.0+

## How this section is organised

These features typically cut across multiple Vivliostyle products — core CSS, CLI, VFM, and themes — so they don't fit neatly into any single per-product section. The "Cookbook" section organises them by **feature**, not by product.

For canonical specification references, see [Supported CSS Features](/en/reference/supported-css-features/) and the [Core API Reference](/en/reference/api/).
