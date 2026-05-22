---
title: CSS Nesting Guide
description: CSS Nesting in Vivliostyle.js v2.42 for organizing typesetting theme CSS without a Sass build step
lang: en
order: 5
---

# CSS Nesting Guide

> **Target version**: Vivliostyle.js v2.42 (2026-04-25)
> Vivliostyle CLI v10.6 bundles Viewer 2.42, so the feature is available out of the box.
>
> **Published**: 2026-05-14
> **Last updated**: 2026-05-14

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

## Where it pays off in typesetting

### 1. Nesting pseudo-elements (works with Vivliostyle's typesetting pseudo-elements too)

CSS Nesting in Vivliostyle.js v2.42 also works with the CSS GCPM pseudo-elements that Vivliostyle handles at typesetting time, such as `::footnote-call` and `::footnote-marker`. This lets you define footnote styles in a single block.

```css
.footnote {
  float: footnote;

  &::footnote-call {
    content: "Note " counter(footnote);
  }

  &::footnote-marker {
    content: "Note " counter(footnote) ": ";
  }
}
```

You can use `.footnote` to mark text as a footnote and define both the in-flow call marker and the footnote-area marker in the same scope.

![Pseudo-element nesting (::footnote-call and ::footnote-marker) in action: "Note 1" and "Note 2" appear in the body text, and "Note 1: …" and "Note 2: …" appear in the footnote area at the bottom of the page.](/cookbook/css-nesting/en/01-pseudo-element-nesting.png)

<details>
<summary>HTML source</summary>

```html
<p>CSS Nesting in Vivliostyle.js v2.42 also works with typesetting pseudo-elements<span class="footnote">First footnote body text.</span>. For example, you can write <code>::footnote-call</code> and <code>::footnote-marker</code> together as nested rules under <code>.footnote</code><span class="footnote">Second footnote body text.</span>.</p>
<p>The footnote area at the bottom of this page should show "Note 1: …" and "Note 2: …".</p>
```

</details>

> Credit: [post by メイユール (@u1f992)](https://x.com/u1f992/status/2053013531600257211)

### 2. Inlining `@media`

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

## Combining with `<picture>` for print-only image styling

Use nested `@media print` to apply print-only outlining to images selected via `<picture>` (see the [Responsive Images Guide](../responsive-images/) for `<picture>` itself):

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

## Migrating existing themes

- **Adding to an existing CSS file**: you can write nested rules directly in your current theme CSS. No configuration change is needed.
- **Browser preview**: modern browsers already implement CSS Nesting, so what you see in a browser matches what `vivliostyle preview` and Viewer produce.
- **Author tip**: start each nested selector with `&`. Plain selectors at the start of a nested block can occasionally be misread as declarations by CSS parsers.

## Known limits

- You can nest *rules* (`@page`, `@media`, class/element selectors). You **cannot nest properties**.
- When invalid selectors appear, the selector-recovery improvements in v2.42 ensure the rest of the stylesheet still parses cleanly (commit [e5d8bc16](https://github.com/vivliostyle/vivliostyle.js/commit/e5d8bc160371c5a7d65d46803a4c11dd7f5739b1)).

## Related guides

- [Responsive Images Guide](../responsive-images/) — combine with CSS Nesting for print-only image styling
- [Footnotes](../footnotes/) — footnote features were also expanded in v2.42
- [CMYK Conversion](../cmyk/)
- [Page Groups](../page-groups/)

## References

- [CSS Nesting Module — W3C](https://www.w3.org/TR/css-nesting-1/)
- [Vivliostyle.js #1032 — Add CSS Nesting support](https://github.com/vivliostyle/vivliostyle.js/issues/1032)
