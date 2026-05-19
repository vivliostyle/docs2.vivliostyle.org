---
title: Page Groups Guide
description: Named pages and the :nth(An+B of C) page selector
lang: en
order: 4
---

# Page Groups Guide

> **Target versions**: Vivliostyle.js v2.39.0+ (released 2025-12-25)
> **Published**: 2026-05-05
> **Last updated**: 2026-05-05

This guide explains named pages and the `:nth(An+B of C)` page selector, which together let you give different chapters of a book entirely different page layouts.

## Why named pages?

A book often needs more than one page design within a single document:

- A wide, illustration-friendly layout for a photo essay chapter
- A narrow, two-column layout for a glossary
- A full-bleed layout for a cover or a part divider

CSS lets you address pages with `@page :left` / `:right` / `:first`, but those selectors only distinguish *facing pages* and *the very first page* — they can't distinguish *which chapter* you're in. **Named pages** fill that gap.

## Named pages — the basics

The `page` property assigns a name to a flow-level box (a section, a `<div>`, etc.):

```css
section.glossary {
  page: narrow;
}

section.gallery {
  page: wide;
}
```

You then style each named page with a matching `@page` rule:

```css
@page narrow {
  size: A5;
  margin: 1.5cm 1cm;
}

@page wide {
  size: A4 landscape;
  margin: 1cm;
}
```

Pages produced by laying out `section.glossary` use the `narrow` page, while pages produced by `section.gallery` use the `wide` page.

## The `:nth()` page selector

Within a single `@page` name (or the unnamed default), `:nth()` selects pages by their position:

```css
@page :nth(1)      { /* the first page */ }
@page :nth(odd)    { /* odd-numbered pages */ }
@page :nth(even)   { /* even-numbered pages */ }
@page :nth(3n+2)   { /* every 3rd page starting from page 2 */ }
@page :nth(-n+3)   { /* the first three pages */ }
```

The `An+B` form follows the same convention as `:nth-child`: `n` is `0, 1, 2, ...`, and any non-positive result is dropped.

## `:nth()` with counter manipulation

Pages are numbered from 1 by default, but `counter-reset: page <n>` on a flow box restarts the page counter at `<n>`. This makes selectors like `:nth(1)` mean *the first page of this chapter*:

```css
section.chapter {
  counter-reset: page 1;
}

@page :nth(1) {
  /* Drop the running header on each chapter's opening page */
  @top-center { content: none; }
}
```

## The page-group concept

When the layout engine flows content into pages and the `page` named on the flow box changes (e.g. `glossary` is followed by `gallery`), Vivliostyle issues a *forced page break*. The block of consecutive pages produced by a single named-page block is a **page group**.

In other words, a page group is "a run of pages all using the same `@page` name, all coming from the same flow-level region in the source." That's the unit `:nth(... of <name>)` selects within.

## `:nth(An+B of C)` — selectors *inside* a page group (new in v2.39.0)

Vivliostyle.js v2.39.0 supports the form `:nth(An+B of <name>)`. It restricts the index to **within** the named page group:

```css
@page :nth(1 of body) {
  /* The first page of every chapter using `page: body` */
  @top-center { content: none; }
  margin-top: 4cm;
}

@page :nth(odd of body) {
  /* Odd-positioned pages within each `body` group */
  @bottom-right { content: counter(page); }
}
```

This is what makes "the first page of every chapter looks different from the rest" easy to express. Without `of <name>`, `:nth(1)` only selects the *very first page of the document*; with it, you select the first page of each group separately.

## Practical example: a chapter-structured book

Combining named pages, `counter-reset`, and `:nth(... of <name>)`:

```css
/* Source structure */
/*
   <article class="cover">      ...   </article>
   <section class="chapter">     ...   </section>
   <section class="chapter">     ...   </section>
   <section class="glossary">    ...   </section>
*/

article.cover    { page: cover; }
section.chapter  { page: body; counter-reset: page 1; }
section.glossary { page: narrow; }

/* Per-chapter front page */
@page :nth(1 of body) {
  @top-center { content: none; }
  margin-top: 4cm;
}

/* Running headers on subsequent chapter pages */
@page :nth(n+2 of body) {
  @top-center { content: string(chapter-title); }
}

/* Cover */
@page cover {
  size: A4;
  margin: 0;
  background: black;  /* For a CMYK-mastered cover use device-cmyk(0 0 0 1) — requires v2.40.0+ (see CMYK Conversion guide) */
}
```

This pattern is used in CSS GCPM 3 Examples 13 and 14, and is now natively supported in Vivliostyle.js v2.39.0.

## Verifying with Vivliostyle Viewer

`@page` rules only manifest in paginated rendering. To check page-group output:

1. Run a build with `vivliostyle preview` (or `npm run preview`)
2. Open the generated HTML in [Vivliostyle Viewer](https://vivliostyle.org/viewer/)
3. Toggle "Spread" view to see facing pages
4. Confirm that each chapter starts with the special opening-page layout

For static verification, run `vivliostyle build` and inspect the output PDF.

## References

- W3C [CSS GCPM 3 §3 Selecting Pages](https://www.w3.org/TR/css-gcpm-3/#the-first-page-pseudo-element)
- Test cases:
  - `vivliostyle.js/packages/core/test/files/named-pages/page-groups.html`
  - `vivliostyle.js/packages/core/test/files/nth-page/nth-of-page.html`
