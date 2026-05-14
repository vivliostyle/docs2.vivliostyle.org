---
title: Welcome to Vivliostyle Documentation
description: Official documentation for Vivliostyle - CSS Typesetting made easy
lang: en
order: 1
---

# Welcome to Vivliostyle Documentation

Vivliostyle is a CSS typesetting ecosystem for creating beautifully formatted documents using web technologies.

## What is Vivliostyle?

<figure>
<img src="/product-en.svg" alt="Vivliostyle products">
<figcaption>Vivliostyle products (<a href="https://gihyo.jp/article/2024/01/vivliostyle-01" target="_blank" rel="noopener noreferrer">Shinyu Murakami / Katsuhiro Ogata “Vivliostyleでなにができるの？” from gihyo.jp ↗</a>)</figcaption>
</figure>

Vivliostyle is an open-source project that provides:

- **[Vivliostyle Viewer](/en/viewer/)** - View and paginate HTML/CSS documents in the browser
- **[Vivliostyle CLI](/en/cli/)** - Command-line tool for generating PDF / EPUB from HTML/Markdown
- **[VFM (Vivliostyle Flavored Markdown)](/en/vfm/)** - Extended Markdown syntax for publishing
- **[Vivliostyle Themes](/en/themes/)** - Pre-designed themes for beautiful documents

## For Vivliostyle Beginners

- <a href="https://vivliostyle.org/tutorials/" target="_blank" rel="noopener noreferrer">Tutorials ↗</a>
- <a href="https://vivliostyle.org/faq/" target="_blank" rel="noopener noreferrer">FAQ ↗</a>
- [Reference](/en/reference/)
- <a href="https://vivliostyle.org/samples/" target="_blank" rel="noopener noreferrer">Samples ↗</a>

## [Cookbook](/en/cookbook/)

Practical, cross-product guides to recently added Vivliostyle features:

- [Footnotes](/en/cookbook/footnotes/) — DPUB-ARIA footnotes, the standard `@page { @footnote { } }` rule, and the new VFM `footnote` modes (v2.41+)
- [CMYK Conversion](/en/cookbook/cmyk/) — `device-cmyk()` and CLI PDF CMYK output (v2.40+)
- [Page Groups](/en/cookbook/page-groups/) — Named pages and the `:nth(An+B of C)` page selector (v2.39+)
- [VFM Extension Hooks](/en/cookbook/vfm-extensions/) — `captionlessImagePolicy`, `editPlugins` hook, and valibot option schemas (VFM v2.7+)
- [Responsive Images & CSS Nesting](/en/cookbook/responsive-and-nesting/) — CSS Nesting (Vivliostyle.js v2.42+) and `<picture>` support (v2.42+)

## Single Source, Multi Output {#ssmo}

One of the key benefits of Vivliostyle is **SSMO (Single Source Multi Output)**:

From a single Markdown source, you can generate:

- **[WebPub](https://docs.vivliostyle.org/en/cli/special-output-settings/#output-in-web-publication-webpub-format)** - HTML pages for online viewing
- **[PDF](https://docs.vivliostyle.org/en/cli/special-output-settings/#generating-print-ready-pdf-pdfx-1a-format)** - Print-ready documents
- **[EPUB](https://docs.vivliostyle.org/en/cli/special-output-settings/#output-in-epub-format)** - E-book format

## VFM Features Demo

### Ruby Text

This demonstrates VFM's {Ruby|ルビ} support.

**VFM Markdown source:**

```markdown
This demonstrates VFM's {Ruby|ルビ} support.
```

### Footnotes

The term "hypertext" was coined by Ted Nelson in 1963, long before the invention of the World Wide Web[^1].

[^1]: Nelson, T. H. (1965). "Complex information processing: a file structure for the complex, the changing and the indeterminate".

**VFM Markdown source:**

```markdown
The term "hypertext" was coined by Ted Nelson in 1963, long before the invention of the World Wide Web[^1].

[^1]: Nelson, T. H. (1965). "Complex information processing: a file structure for the complex, the changing and the indeterminate".
```

## Downloads (built by Vivliostyle CLI)

Web Pub, PDF and EPUB were generated from the documents (Markdown source) on this site using Vivliostyle CLI (Single Source, Multi Output).

| Product | Vivliostyle Viewer | PDF | EPUB |
|---|---|---|---|
| [Vivliostyle Viewer](/en/viewer/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/viewer-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-viewer-en.pdf) | [EPUB](/downloads/vivliostyle-viewer-en.epub) |
| [Vivliostyle CLI](/en/cli/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/cli-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-cli-en.pdf) | [EPUB](/downloads/vivliostyle-cli-en.epub) |
| [VFM](/en/vfm/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/vfm-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vfm-en.pdf) | [EPUB](/downloads/vfm-en.epub) |
| [Vivliostyle Themes](/en/themes/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/themes-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-themes-en.pdf) | [EPUB](/downloads/vivliostyle-themes-en.epub) |
| [Reference](/en/reference/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/reference-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-reference-en.pdf) | [EPUB](/downloads/vivliostyle-reference-en.epub) |
| [Cookbook](/en/cookbook/) | <a href="https://vivliostyle.org/viewer/#src=https://docs.vivliostyle.org/publications/cookbook-en/publication.json" target="_blank" rel="noopener noreferrer">WebPub ↗</a> | [PDF](/downloads/vivliostyle-cookbook-en.pdf) | [EPUB](/downloads/vivliostyle-cookbook-en.epub) |
