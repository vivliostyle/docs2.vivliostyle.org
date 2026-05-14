---
title: Responsive Images & CSS Nesting Guide
description: CSS Nesting (Vivliostyle.js v2.42) and <picture> / <source media> (v2.42) for book typesetting
lang: en
order: 6
---

# Responsive Images & CSS Nesting Guide

> **Target versions**:
>
> - **CSS Nesting**: Vivliostyle.js v2.42+ (released 2026-04-25)
> - **`<picture>` / `<source media>`**: Vivliostyle.js v2.42+ (released 2026-05-13)
> - Vivliostyle CLI v10.6+ bundles Viewer 2.42, so both features are available out of the box.
>
> **Published**: 2026-05-14
> **Last updated**: 2026-05-14

This guide covers two "modern web platform" features added in the Vivliostyle.js v2.42 series, framed around book-typesetting use cases. Both directly improve life for theme authors and content writers.

## What this guide covers

- **CSS Nesting** — author theme CSS much more ergonomically. Nest rules with `&` without going through a Sass build step.
- **`<picture>` / `<source media>`** — serve different images from a single manuscript depending on output size, print vs. preview, colour vs. mono, and so on.

---

## Part 1 · CSS Nesting

### What's new

The [CSS Nesting Module](https://www.w3.org/TR/css-nesting-1/) lets you write child rules inside a parent rule using `&`. In plain CSS you would repeat the selector — `.chapter h2 { ... }`, `.chapter p { ... }` and so on — but with nesting **you write them once, grouped inside `.chapter { }`**. No build tool or converter is required; browsers and Vivliostyle interpret it directly.

```css
.chapter {
  font-family: 'Source Serif Pro', serif;

  & h2 {
    font-size: 1.4em;
    border-bottom: 1px solid currentColor;
  }

  & p:first-of-type::first-letter {
    font-size: 3em;
    float: left;
    margin-right: 0.1em;
  }
}
```

This expands to:

```css
.chapter { font-family: 'Source Serif Pro', serif; }
.chapter h2 { font-size: 1.4em; border-bottom: 1px solid currentColor; }
.chapter p:first-of-type::first-letter { font-size: 3em; float: left; margin-right: 0.1em; }
```

### Where it pays off in typesetting

#### 1. Nesting `@page` rules

Books frequently need different margins and folio positions for left and right pages. Nesting lets you keep them in one block.

```css
@page {
  size: A5;
  margin: 18mm;

  & :left {
    margin-left: 24mm;
    @bottom-left { content: counter(page); }
  }

  & :right {
    margin-right: 24mm;
    @bottom-right { content: counter(page); }
  }

  & :first {
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }
}
```

#### 2. Per-chapter style overrides

Combined with [named pages](../page-groups/), nesting collapses what was once a long list of `@page name :left` / `:right` blocks into something legible:

```css
@page chapter-glossary {
  size: A5;
  margin: 12mm;

  & :left  { margin-left: 16mm; }
  & :right { margin-right: 16mm; }
}
```

#### 3. Inlining `@media`

You can place `@media print` next to the rule it modifies, which makes it easy to separate preview-only decoration from print output.

```css
.cover {
  background: var(--cover-bg);

  @media screen {
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  @media print {
    box-shadow: none;
    break-after: page;
  }
}
```

### Migrating existing themes

- **Adding to an existing CSS file**: you can write nested rules directly in your current theme CSS. No configuration change is needed.
- **Browser preview**: modern browsers already implement CSS Nesting, so what you see in a browser matches what `vivliostyle preview` and Viewer produce.
- **Author tip**: start each nested selector with `&`. Plain selectors at the start of a nested block can occasionally be misread as declarations by CSS parsers.

### Known limits

- You can nest *rules* (`@page`, `@media`, class/element selectors). You **cannot nest properties**.
- When invalid selectors appear, the selector-recovery improvements in v2.42+ ensure the rest of the stylesheet still parses cleanly ([#1032](https://github.com/vivliostyle/vivliostyle.js/issues/1032)).

---

## Part 2 · `<picture>` / `<source media>`

### What's new

Starting with Vivliostyle.js v2.42, the HTML `<picture>` element and `<source media>` attribute are evaluated during typesetting ([#1089](https://github.com/vivliostyle/vivliostyle.js/issues/1089)). One manuscript can now select different image assets depending on output conditions.

### Where it pays off

#### 1. Print vs. screen

Use a heavy CMYK image for PDFs and a lighter RGB version for live preview:

```html
<picture>
  <source media="print" srcset="./img/cover-cmyk.tiff" />
  <img src="./img/cover-rgb.jpg" alt="Cover" />
</picture>
```

Vivliostyle treats typesetting as `print` media (both in the Viewer and through the CLI), so the CMYK source is picked up for PDF / EPUB output.

#### 2. Output-size-aware resolution

Share a manuscript between A4 and a smaller pocketbook trim, with different image resolutions:

```html
<picture>
  <source media="(min-width: 180mm)" srcset="./img/diagram-2x.png" />
  <source media="(min-width: 120mm)" srcset="./img/diagram-1.5x.png" />
  <img src="./img/diagram-1x.png" alt="System diagram" />
</picture>
```

#### 3. Prefer modern formats

Serve AVIF / WebP to capable renderers and keep PNG for EPUB compatibility:

```html
<picture>
  <source type="image/avif" srcset="./img/photo.avif" />
  <source type="image/webp" srcset="./img/photo.webp" />
  <img src="./img/photo.png" alt="Photograph" />
</picture>
```

### Combining with VFM image paragraphs

VFM's `![alt](src)` only emits a single `<img>`, so to use `<picture>` you write HTML directly. VFM supports GFM-style HTML passthrough, so dropping a `<picture>` block into Markdown is fine:

```markdown
An inline figure follows.

<picture>
  <source media="print" srcset="./img/figure-cmyk.tiff" />
  <img src="./img/figure-rgb.jpg" alt="Figure 1: Architecture" />
</picture>

Continuing prose…
```

Combine this with `captionlessImagePolicy: 'figure-with-figcaption'` from the [VFM Extension Hooks Guide](../vfm-extensions/) to keep `<picture>` paragraphs aligned with VFM's `<figure>` structure for counters and captions.

### Behaviour in EPUB / SVG output

- **EPUB**: the webpub / EPUB output retains the `<picture>` element. Reading systems that support `<picture>` pick the right `<source>`; older ones fall back to the inner `<img>`.
- **PDF**: PDF flattens to raster/vector pixels, so only the source matching `media="print"` is embedded. Specifying the CMYK asset on the `<source media="print">` line is the canonical recipe.
- **`<picture>` *inside* SVG**: SVG does not allow `<picture>` directly. Reference the SVG with `<img>` and wrap *that* `<img>` in `<picture>`.

---

## Combining both features

Outline the chosen `<picture>` image only in print, using nested `@media`:

```css
figure {
  margin: 0;

  & picture img {
    display: block;
    max-width: 100%;
  }

  @media print {
    & picture img {
      outline: 0.25mm solid black;
      outline-offset: 0.5mm;
    }
  }
}
```

---

## Version cheat sheet

| Feature                          | Available from         | Notes                                                              |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| CSS Nesting                      | Vivliostyle.js v2.42 | Selector recovery improvements landed in 2.42                     |
| `<picture>` / `<source media>`   | Vivliostyle.js v2.42 | Bundled with CLI v10.6 (Viewer 2.42)                            |
| Robust `<img srcset>` preloading | Vivliostyle.js v2.42 | Prerequisite for `<picture>` ([2579d4a](https://github.com/vivliostyle/vivliostyle.js/commit/2579d4a4d7bc7a9216f0f25d99987f49d866f285)) |

## Related guides

- [VFM Extension Hooks Guide](../vfm-extensions/)
- [Footnotes](../footnotes/) — footnote features were also expanded in v2.42
- [CMYK Conversion](../cmyk/)
- [Page Groups](../page-groups/)

## References

- [CSS Nesting Module — W3C](https://www.w3.org/TR/css-nesting-1/)
- [HTML `<picture>` element — MDN](https://developer.mozilla.org/docs/Web/HTML/Element/picture)
- [Vivliostyle.js #1032 — Add CSS Nesting support](https://github.com/vivliostyle/vivliostyle.js/issues/1032)
- [Vivliostyle.js #1089 — `<picture>` support](https://github.com/vivliostyle/vivliostyle.js/issues/1089)
