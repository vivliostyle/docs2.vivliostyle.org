---
title: Footnotes Guide
description: Footnote support in Vivliostyle.js — what was already there and what's new in v2.41.0
lang: en
order: 2
---

# Footnotes Guide

> **Target versions**: Vivliostyle.js v2.41.0+ (released 2026-04-11), Vivliostyle CLI v10.5.0+
> **Published**: 2026-05-05
> **Last updated**: 2026-05-05

This guide explains how to produce footnotes with Vivliostyle, structured around **what was already supported** and **what's new in v2.41.0**.

## Part 1 · Overview

Vivliostyle.js v2.41.0 adds the following footnote-related features:

- **DPUB-ARIA footnote support** ([#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700), [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703)) — recognises footnotes from `role="doc-noteref"` / `role="doc-footnote"` attributes. The built-in UA stylesheet automatically applies `float: footnote`, **so no theme CSS is required**.
- **CSS `@footnote` rule** ([#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045), [#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723)) — supports the standard CSS GCPM 3 syntax `@page { @footnote { ... } }` for styling the footnote area, including `::before` content rendering.
- **`footnote-display` property** ([#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825)) — `block` / `inline` / `compact`, enabling inline-rendered footnotes.
- **`list-style-position: outside` for `::footnote-marker`** ([#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702)).
- **Page-scoped footnote counter reset** — counters now coordinate across page groups.

### Footnote recognition mechanisms (with v2.41.0)

| Mechanism | HTML pattern | Theme CSS | Notes |
|---|---|---|---|
| **CSS GCPM** (existing) | `<span class="footnote">` | A theme containing `.footnote { float: footnote }` is **required** | Supported by theme-base / theme-techbook |
| **EPUB** (existing) | `epub:type="noteref"` / `epub:type="footnote"` | Not required (built-in recognition) | |
| **DPUB-ARIA** (new in v2.41.0) | `<a role="doc-noteref">` → `<aside role="doc-footnote">` | **Not required** (built-in UA stylesheet) | [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703) |

### Cheat sheet (v2.41.0 footnote features)

| New | What you want | `vivliostyle.config.js` | Theme / CSS | Result |
|:---:|---|---|---|---|
| | Endnotes (end of document) | `vfm: { footnote: 'pandoc' }` (default) | Not required | Endnote section at document end |
| | Footnotes written directly in HTML (CSS class) | — (raw HTML) | theme-base / theme-techbook | `float: footnote` based footnote |
| ★ | Footnotes (VFM → GCPM) | `vfm: { footnote: 'gcpm' }` | theme-base / theme-techbook | CSS-class based footnote |
| ★ | Footnotes (VFM → DPUB) | `vfm: { footnote: 'dpub' }` | **Not required** (UA stylesheet in v2.41.0) | DPUB-ARIA based footnote |
| ★ | Styling the footnote area | `gcpm` / `dpub` or raw HTML | `@page { @footnote { ... } }` | Standard CSS support in v2.41.0 |
| ★ | Inline footnote display | `gcpm` / `dpub` or raw HTML | `footnote-display: inline` | New in v2.41.0 |

### Terminology

The terminology in this guide follows the W3C [Requirements for Japanese Text Layout (JLReq) §4.2 "Processing of Notes"](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese):

- **Footnotes** — notes placed at the foot of a page (the spine-bottom of the type area in horizontal writing) ([JLReq §4.2.5](https://www.w3.org/TR/jlreq/#processing_of_footnotes_in_horizontal_writing_mode))
- **Endnotes** — notes placed after a paragraph, section, chapter, or the entire main text ([JLReq §4.2.4](https://www.w3.org/TR/jlreq/#processing_of_endnotes_in_vertical_writing_mode_or_horizontal_writing_mode))
- **Sidenotes** — notes placed in the fore-edge margin ([JLReq §4.2.6](https://www.w3.org/TR/jlreq/#processing_of_sidenotes_in_vertical_writing_mode))

**VFM footnote modes and sidenotes**: None of the three VFM modes (`pandoc` / `gcpm` / `dpub`) directly support sidenotes. The `dpub` mode generates `<aside role="doc-footnote">`, but Vivliostyle.js's built-in UA stylesheet automatically applies `float: footnote`, so the result is rendered as a **page footnote**.

**Scope of CSS `@footnote`**: The CSS GCPM 3 `@page { @footnote { ... } }` rule and `footnote-display` apply only to **footnotes** (those placed at the foot of the page via `float: footnote`). They have no effect on endnotes.

## Part 2 · Footnote support before v2.41.0

### 1. The role of notes in CSS-based publishing

Notes (footnotes and endnotes) are an essential element of book publishing. CSS Generated Content for Paged Media (GCPM) Module 3 defines `float: footnote` as the mechanism that takes a flow-level box out of the main flow and reflows it into a footnote area at the bottom of the page.

### 2. Footnotes written directly in HTML

The most direct way to author footnotes is to mark them in HTML:

```html
<p>The text<span class="footnote">A footnote.</span> continues here.</p>
```

With a theme that includes `.footnote { float: footnote }` (such as theme-base or theme-techbook), the contents of `<span class="footnote">` is moved to the page-bottom footnote area at layout time. The reference number and the marker in the footnote area are generated through the `::footnote-call` and `::footnote-marker` pseudo-elements.

### 3. Pandoc-style endnotes in VFM (the legacy default)

Up to and including VFM v2.5.x, `[^1]` notation in Markdown produced **endnotes** in Pandoc's output style:

```markdown
Some text.[^1]

[^1]: A note.
```

VFM converts this into a `<section role="doc-endnotes">` block placed at the **end of the document body**. Because endnotes flow inline with the main text, **`float: footnote` does not apply**, and the built-in `@footnote` styling has no effect on them.

### 4. Screen vs print presentation in theme-techbook

theme-techbook provides separate styling under `@media screen` and `@media print`, so the visual appearance of notes differs between the on-screen preview and the printed PDF. Use the Vivliostyle Viewer to confirm the printed look.

## Part 3 · New footnote features in v2.41.0

### 5. DPUB-ARIA footnote support ([#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700), [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703))

Vivliostyle.js v2.41.0 recognises footnotes from DPUB-ARIA roles directly:

```html
<p>The text<a role="doc-noteref" href="#fn1">1</a> continues.</p>
<aside id="fn1" role="doc-footnote">A note.</aside>
```

The built-in UA stylesheet applies `float: footnote` to `[role="doc-footnote"]`, so this works **without any theme CSS**. The note appears at the foot of the page with a reference number generated automatically.

### 6. Comparison of the three recognition mechanisms

| Mechanism | Origin | Recognised pattern | Theme CSS |
|---|---|---|---|
| CSS GCPM | CSS Generated Content for Paged Media | `<span class="footnote">` | Required |
| EPUB | EPUB 3 | `epub:type="noteref"` / `epub:type="footnote"` | Not required |
| DPUB-ARIA | W3C DPUB-ARIA 1.1 | `role="doc-noteref"` / `role="doc-footnote"` | Not required (v2.41.0) |

The three mechanisms can coexist within the same document, but in practice one of them is chosen per source.

### 7. Standard CSS `@footnote` rule ([#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045), [#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723))

Vivliostyle previously used a vendor-specific `@-adapt-footnote-area` at-rule. v2.41.0 adds support for the standard CSS GCPM 3 `@footnote` rule:

```css
@page {
  @footnote {
    border-top: 0.5pt solid black;
    padding-top: 4pt;
    font-size: 0.85em;
  }
}
```

`::before` content is also rendered, so you can prepend custom labels:

```css
@page {
  @footnote::before {
    content: "Notes:";
    display: block;
    font-weight: bold;
  }
}
```

### 8. The `footnote-display` property ([#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825))

Lays out footnote bodies in different ways:

- `block` (default) — each footnote on its own line
- `inline` — multiple footnotes flowed on the same line
- `compact` — short footnotes packed inline, long ones on their own line

```css
@page {
  @footnote {
    footnote-display: compact;
  }
}
```

### 9. `list-style-position: outside` for `::footnote-marker` ([#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702))

The footnote marker now respects `list-style-position`, so the marker can sit outside the footnote body to produce a hanging-indent presentation:

```css
::footnote-marker {
  list-style-position: outside;
}
```

### 10. Page-scoped reset and cross-scope counters

Footnote counters can now be reset per page group, which is useful for books that restart footnote numbering at each chapter. Use `counter-reset` together with the named-page mechanism described in the [Page Groups guide](./page-groups/).

### 11. The three VFM `footnote` modes (VFM [PR#226](https://github.com/vivliostyle/vfm/pull/226), [PR#231](https://github.com/vivliostyle/vfm/pull/231))

VFM v2.6.0 introduces a `footnote` option on the VFM transformer:

- `'pandoc'` (default) — endnotes (`<section role="doc-endnotes">` at the end of the document)
- `'gcpm'` (new) — footnotes via `<span class="footnote">` (theme CSS required)
- `'dpub'` (new) — footnotes via `<aside role="doc-footnote">` (**no theme CSS required**, slated to become the default — [#234](https://github.com/vivliostyle/vfm/issues/234))

In `vivliostyle.config.js`:

```js
export default {
  vfm: {
    footnote: 'dpub',
  },
  // ...
};
```

### 12. Object form of the VFM `footnote` option

Beyond the three string values, `footnote` also accepts an object `{ mode, body }` that lets you customise the generated HTML:

```js
vfm: {
  footnote: {
    mode: 'gcpm',
    body: (h, props, children) =>
      h('span.footnote', props, h('span.footnote-wrap', ...children)),
  },
}
```

The intended use case is keeping styling-only DOM transformations (such as adding a wrapper for hanging indent) **out of the Markdown source**. Authors write plain Markdown footnotes; the build configuration applies the wrapper.

### 13. Per-file configuration via YAML frontmatter

The footnote mode can also be set per file in YAML frontmatter, overriding the global config:

```yaml
---
vfm:
  footnote: dpub  # or pandoc, gcpm
---
```

This is convenient when most of the project uses the project-wide default but a single file needs a different mode.

### 14. Summary of CSS footnote properties

| Property / at-rule | Purpose |
|---|---|
| `float: footnote` | Move a flow-level element to the page-bottom footnote area |
| `@page { @footnote { ... } }` | Style the footnote area itself |
| `footnote-display` | `block` / `inline` / `compact` |
| `footnote-policy` | Control whether a note may be split across pages |
| `::footnote-call` | Pseudo-element for the in-text reference marker |
| `::footnote-marker` | Pseudo-element for the marker shown beside the note body |

## Part 4 · Summary

The note kinds available through VFM, with their notation, configuration, and CSS:

| Note kind | VFM markup | `vivliostyle.config.js` | Theme / CSS | Notes |
|---|---|---|---|---|
| **Endnotes** | `[^1]` | `vfm: { footnote: 'pandoc' }` (default) | Not required (rendered as `<section role="doc-endnotes">` in normal flow) | `@footnote` and `footnote-display` do not apply |
| **Footnotes (CSS class)** | `[^1]` | `vfm: { footnote: 'gcpm' }` | A theme with `.footnote { float: footnote }` is **required** (theme-base / theme-techbook) | Emitted as `<span class="footnote">`. New in VFM v2.6.0 |
| **Footnotes (DPUB-ARIA)** | `[^1]` | `vfm: { footnote: 'dpub' }` | **Not required** (UA stylesheet in v2.41.0). Customise via `@page { @footnote { } }` | Emitted as `<aside role="doc-footnote">`. New in VFM v2.6.0. Slated to become the default ([#234](https://github.com/vivliostyle/vfm/issues/234)) |
| **Sidenotes** | — | — | — | **Not supported** by the VFM footnote modes (`pandoc` / `gcpm` / `dpub`). Sidenotes require custom HTML + CSS |

> **Choosing between gcpm and dpub**:
>
> - **dpub recommended** — works out of the box without theme CSS. Slated to become the default.
> - **gcpm** — when compatibility with existing themes (theme-base / theme-techbook) is required, or when you want to use the object-form `body` callback to customise the generated HTML.

## References

- W3C [CSS GCPM 3 §2 Footnotes](https://www.w3.org/TR/css-gcpm-3/#footnotes)
- W3C [DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/) (definitions of `doc-noteref` / `doc-footnote`)
- W3C [JLReq §4.2 Processing of Notes](https://www.w3.org/TR/jlreq/#processing-of-notes-in-japanese)
- Qiita: [@u1f992 — *Using the footnote feature of Vivliostyle.js v2.41.0 (CLI v10.5.0) from Markdown*](https://qiita.com/u1f992/items/6466c03aa4f569a39572)
- Test cases: `vivliostyle.js/packages/core/test/files/footnotes/`
- VFM source: `vfm/src/plugins/footnotes.ts`, [PR#226](https://github.com/vivliostyle/vfm/pull/226), [PR#231](https://github.com/vivliostyle/vfm/pull/231)
- VFM [Issue #234](https://github.com/vivliostyle/vfm/issues/234) (planned default switch to dpub)
- Themes: `themes/packages/@vivliostyle/theme-base/css/partial/footnote.css`, `theme-techbook/theme.css`
