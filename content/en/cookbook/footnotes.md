---
title: Footnotes Guide
description: Footnote support in Vivliostyle.js — what was already there and what's new in v2.41.0
lang: en
order: 2
---

# Footnotes Guide

> **Target versions**: Vivliostyle.js v2.41.0+ (released 2026-04-11) / v2.42.0+ (released 2026-04-25, by feature), Vivliostyle CLI v10.6.0+ (bundles Viewer 2.42.1)
> **Published**: 2026-05-05
> **Last updated**: 2026-05-14
>
> - **Added in v2.41.0**: DPUB-ARIA footnote auto-recognition (built-in `float: footnote`), the `@page { @footnote { … } }` rule, and `@footnote ::before` content.
> - **Added in v2.42.0**: CSS footnote properties / pseudo-elements applied to DPUB-ARIA footnotes (`footnote-display`, `::footnote-call`, author-supplied `::footnote-marker` content / list-style-position, etc. — see [#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)).
>
> Vivliostyle CLI 10.6.0+ bundles Viewer 2.42.1, so the v2.42.0 features described in this guide work out of the box with `vivliostyle preview` / `vivliostyle build` without any extra `overrides` setup.

This guide explains how to produce footnotes with **Vivliostyle.js** (and VFM), structured around **what was already supported** and **what's new in v2.41.0 / v2.42.0**.

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
- **Sidenotes** — notes placed in the fore-edge margin ([JLReq §4.2.6](https://www.w3.org/TR/jlreq/#processing_of_sidenote_in_vertical_writing_mode))

**VFM footnote modes and sidenotes**: None of the three VFM modes (`pandoc` / `gcpm` / `dpub`) directly support sidenotes. The `dpub` mode generates `<aside role="doc-footnote">`, but Vivliostyle.js's built-in UA stylesheet automatically applies `float: footnote`, so the result is rendered as a **page footnote**.

**Scope of CSS `@footnote`**: The CSS GCPM 3 `@page { @footnote { ... } }` rule and `footnote-display` apply only to **footnotes** (those placed at the foot of the page via `float: footnote`). They have no effect on endnotes.

## Part 2 · Footnote support before v2.41.0

### The role of notes in CSS-based publishing

Notes (footnotes and endnotes) are an essential element of book publishing. CSS Generated Content for Paged Media (GCPM) Module 3 defines `float: footnote` as the mechanism that takes a flow-level box out of the main flow and reflows it into a footnote area at the bottom of the page.

### Footnotes written directly in HTML

The most direct way to author footnotes is to mark them in HTML:

```html
<p>The text<span class="footnote">A footnote.</span> continues here.</p>
```

With a theme that includes `.footnote { float: footnote }` (such as theme-base or theme-techbook), the contents of `<span class="footnote">` is moved to the page-bottom footnote area at layout time. The reference number and the marker in the footnote area are generated through the `::footnote-call` and `::footnote-marker` pseudo-elements.

![GCPM class-based footnote: in-body superscript reference plus an automatically numbered marker in the page-bottom footnote area](/cookbook/footnotes/en/01-html-class-themebase.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 1: HTML class footnote (theme-base style)"
vfm:
  footnote: gcpm
---

A footnote written directly in HTML as `<span class="footnote">`[^1] is moved to the page-bottom footnote area at layout time, thanks to a theme (theme-base / theme-techbook) that defines `.footnote { float: footnote }`.

Multiple references in the same paragraph[^2] share an auto-incrementing counter, generated by the `::footnote-call` and `::footnote-marker` pseudo-elements.

[^1]: The footnote body. `float: footnote` moves it to the page-bottom area at layout time.

[^2]: A second note. Numbering is automatic.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>A footnote written directly in HTML as <code>&#x3C;span class="footnote"></code><span class="footnote" id="fn-1" role="doc-footnote">The footnote body. <code>float: footnote</code> moves it to the page-bottom area at layout time.</span> is moved to the page-bottom footnote area at layout time, thanks to a theme (theme-base / theme-techbook) that defines <code>.footnote { float: footnote }</code>.</p>
<p>Multiple references in the same paragraph<span class="footnote" id="fn-2" role="doc-footnote">A second note. Numbering is automatic.</span> share an auto-incrementing counter, generated by the <code>::footnote-call</code> and <code>::footnote-marker</code> pseudo-elements.</p>
```

</details>

### Pandoc-style endnotes in VFM (the legacy default)

Up to and including VFM v2.5.x, `[^1]` notation in Markdown produced **endnotes** in Pandoc's output style:

```markdown
Some text.[^1]

[^1]: A note.
```

VFM converts this into a `<section role="doc-endnotes">` block placed at the **end of the document body**. Because endnotes flow inline with the main text, **`float: footnote` does not apply**, and the built-in `@footnote` styling has no effect on them.

![VFM Pandoc-style endnotes: a `<section role="doc-endnotes">` is appended at the end of the body, each note carrying a back-link](/cookbook/footnotes/en/02-vfm-pandoc-endnotes.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 2: VFM Pandoc-style endnotes"
vfm:
  footnote: pandoc
---

VFM's default setting (`footnote: 'pandoc'`) renders `[^1]` as a `<section role="doc-endnotes">` appended to the end of the document[^1].

Because endnotes flow inline with the main text, they are not subject to `float: footnote`, and `@page { @footnote { } }` styling has no effect on them[^2].

[^1]: First endnote body.

[^2]: Second endnote body.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>VFM's default setting (<code>footnote: 'pandoc'</code>) renders <code>[^1]</code> as a <code>&#x3C;section role="doc-endnotes"></code> appended to the end of the document<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>.</p>
<p>Because endnotes flow inline with the main text, they are not subject to <code>float: footnote</code>, and <code>@page { @footnote { } }</code> styling has no effect on them<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>.</p>
<section class="footnotes" role="doc-endnotes">
  <hr>
  <ol>
    <li id="fn1" role="doc-endnote">First endnote body.<a href="#fnref1" class="footnote-back" role="doc-backlink">↩</a></li>
    <li id="fn2" role="doc-endnote">Second endnote body.<a href="#fnref2" class="footnote-back" role="doc-backlink">↩</a></li>
  </ol>
</section>
```

</details>

### Screen vs print presentation in theme-techbook

theme-techbook provides separate styling under `@media screen` and `@media print`, so the visual appearance of notes differs between the on-screen preview and the printed PDF. Use the Vivliostyle Viewer to confirm the printed look.

## Part 3 · New footnote features in v2.41.0

### DPUB-ARIA footnote support ([#1700](https://github.com/vivliostyle/vivliostyle.js/issues/1700), [PR#1703](https://github.com/vivliostyle/vivliostyle.js/pull/1703))

Vivliostyle.js v2.41.0 recognises footnotes from DPUB-ARIA roles directly:

```html
<p>The text<a role="doc-noteref" href="#fn1">1</a> continues.</p>
<aside id="fn1" role="doc-footnote">A note.</aside>
```

The built-in UA stylesheet applies `float: footnote` to `[role="doc-footnote"]`, so this works **without any theme CSS**. The note appears at the foot of the page, and the in-text reference marker (`::footnote-call`) is generated automatically.

![DPUB-ARIA footnotes auto-floated to the page-bottom area without any theme CSS](/cookbook/footnotes/en/03-dpub-aria-default.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 3: DPUB-ARIA footnote (no theme CSS)"
vfm:
  footnote: dpub
---

Writing `[^1]` in the body causes VFM's dpub mode to emit `<a role="doc-noteref">`[^1] in-text and `<aside role="doc-footnote">` separately.

Vivliostyle.js v2.41.0+ applies `float: footnote` automatically through its built-in UA stylesheet, so the note is placed in the page-bottom area without any theme CSS[^2].

[^1]: The footnote body. No CSS has been written for this rendering.

[^2]: A second note. Numbering is automatic.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>Writing <code>[^1]</code> in the body causes VFM's dpub mode to emit <code>&#x3C;a role="doc-noteref"></code><a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a> in-text and <code>&#x3C;aside role="doc-footnote"></code> separately.</p>
<p>Vivliostyle.js v2.41.0+ applies <code>float: footnote</code> automatically through its built-in UA stylesheet, so the note is placed in the page-bottom area without any theme CSS<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>.</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>The footnote body. No CSS has been written for this rendering.</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>A second note. Numbering is automatic.</aside>
```

</details>

> **About the footnote-area marker (v2.42.0+)**: Authoring `::footnote-marker` content for DPUB-ARIA asides via author CSS requires **Vivliostyle.js v2.42.0+** (added in [#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)). On top of that, Vivliostyle's DPUB-ARIA implementation only renders the author's `content` when paired with **`list-style-position: outside`** — `inside` (the CSS default) drops the author content silently:
>
> ```css
> aside.footnote { margin-inline-start: 1.5em; }  /* room for the marker */
> aside.footnote::footnote-marker {
>   content: counter(footnote) ". ";
>   list-style-position: outside;  /* required for DPUB-ARIA */
> }
> ```
>
> On v2.41.0 (or older Viewer bundles) you can get an equivalent look by writing the marker as inline HTML inside the aside (e.g. `<aside><sup>1</sup>…</aside>`).

### Comparison of the three recognition mechanisms

| Mechanism | Origin | Recognised pattern | Theme CSS |
|---|---|---|---|
| CSS GCPM | CSS Generated Content for Paged Media | `<span class="footnote">` | Required |
| EPUB | EPUB 3 | `epub:type="noteref"` / `epub:type="footnote"` | Not required |
| DPUB-ARIA | W3C DPUB-ARIA 1.1 | `role="doc-noteref"` / `role="doc-footnote"` | Not required (v2.41.0) |

The three mechanisms can coexist within the same document, but in practice one of them is chosen per source.

### Standard CSS `@footnote` rule ([#1045](https://github.com/vivliostyle/vivliostyle.js/issues/1045), [#1723](https://github.com/vivliostyle/vivliostyle.js/issues/1723))

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

`::before` content is also rendered, so you can prepend custom labels. **The correct syntax is `@footnote ::before` with a single space** — without the space the entire `@page` block is invalid and silently dropped:

```css
@page {
  @footnote ::before {
    content: "Notes:";
    display: block;
    font-weight: bold;
  }
}
```

![`@page { @footnote { ... } @footnote ::before { ... } }` styling: top border and a generated "Notes" heading on the footnote area](/cookbook/footnotes/en/04-page-footnote-styled.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 4: Custom styling via @page { @footnote { … } }"
vfm:
  footnote: dpub
---

This example styles the footnote area with `@page { @footnote { … } }`[^1], applying a top border, padding, and a generated "Notes" heading via `::before`.

With multiple notes[^2], the heading appears once for the entire footnote area, not per note.

[^1]: A styled footnote.

[^2]: A second styled footnote.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>This example styles the footnote area with <code>@page { @footnote { … } }</code><a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>, applying a top border, padding, and a generated "Notes" heading via <code>::before</code>.</p>
<p>With multiple notes<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>, the heading appears once for the entire footnote area, not per note.</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>A styled footnote.</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>A second styled footnote.</aside>
```

</details>

### The `footnote-display` property ([#1825](https://github.com/vivliostyle/vivliostyle.js/issues/1825))

> **Applying this to DPUB-ARIA footnotes requires Vivliostyle.js v2.42.0+** (added in [#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)). The GCPM class form (`<span class="footnote">`) accepts it from v2.41.0 and earlier.

Lays out footnote bodies in different ways. The property goes on the **footnote element itself** (not inside `@footnote`):

- `block` (default) — each footnote on its own line
- `inline` — multiple footnotes flow on the same line
- `compact` — short footnotes flow inline as unbreakable units; notes that don't fit on one line fall back to block

```css
.footnote { footnote-display: inline; }
```

`inline`:

![`footnote-display: inline` flows three short footnote bodies on the same line](/cookbook/footnotes/en/05-footnote-display-inline.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 5: footnote-display: inline"
vfm:
  footnote: dpub
---

With `footnote-display: inline`, multiple footnotes flow on the same line[^1]. Three short references[^2] in a row[^3] still keep the footnote area compact in the vertical direction.

[^1]: A short note.

[^2]: Another short note.

[^3]: A third short note.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>With <code>footnote-display: inline</code>, multiple footnotes flow on the same line<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>. Three short references<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a> in a row<a id="fnref3" href="#fn3" class="footnote-ref" role="doc-noteref"><sup>3</sup></a> still keep the footnote area compact in the vertical direction.</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>A short note.</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>Another short note.</aside>
<aside id="fn3" class="footnote" role="doc-footnote"><a href="#fnref3" class="footnote-back" role="doc-backlink"><sup>3</sup></a>A third short note.</aside>
```

</details>

`compact` (short notes inline, long ones break to block):

![`footnote-display: compact` keeps three short notes inline while a long fourth note falls back to block](/cookbook/footnotes/en/06-footnote-display-compact.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 6: footnote-display: compact"
vfm:
  footnote: dpub
---

`footnote-display: compact` packs short notes inline[^1] as unbreakable units[^2], with following short notes joining the same run[^3]. A note that does not fit on one rendered line falls back to block automatically[^4].

[^1]: A short note.

[^2]: Another short note.

[^3]: A third short note.

[^4]: A longer note that cannot fit on one rendered inline line and therefore falls back to a block layout under `compact`.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p><code>footnote-display: compact</code> packs short notes inline<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a> as unbreakable units<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>, with following short notes joining the same run<a id="fnref3" href="#fn3" class="footnote-ref" role="doc-noteref"><sup>3</sup></a>. A note that does not fit on one rendered line falls back to block automatically<a id="fnref4" href="#fn4" class="footnote-ref" role="doc-noteref"><sup>4</sup></a>.</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>A short note.</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>Another short note.</aside>
<aside id="fn3" class="footnote" role="doc-footnote"><a href="#fnref3" class="footnote-back" role="doc-backlink"><sup>3</sup></a>A third short note.</aside>
<aside id="fn4" class="footnote" role="doc-footnote"><a href="#fnref4" class="footnote-back" role="doc-backlink"><sup>4</sup></a>A longer note that cannot fit on one rendered inline line and therefore falls back to a block layout under <code>compact</code>.</aside>
```

</details>

### `list-style-position: outside` for `::footnote-marker` ([#1702](https://github.com/vivliostyle/vivliostyle.js/issues/1702))

> **Applying author `::footnote-marker` styles to DPUB-ARIA footnotes requires Vivliostyle.js v2.42.0+** ([#1884](https://github.com/vivliostyle/vivliostyle.js/issues/1884)). The GCPM class form has accepted these styles since earlier releases.

The footnote marker now respects `list-style-position`, so the marker can sit outside the footnote body to produce a hanging-indent presentation:

```css
aside.footnote { margin-inline-start: 1.5em; }
aside.footnote::footnote-marker {
  content: counter(footnote) ". ";
  list-style-position: outside;
}
```

![`::footnote-marker` with `list-style-position: outside` hangs the marker to the left of the body; continuation lines align with the body's left edge](/cookbook/footnotes/en/07-footnote-marker-outside.png)

<details>
<summary>VFM Markdown source</summary>

```markdown
---
title: "Example 7: ::footnote-marker with list-style-position: outside"
vfm:
  footnote: dpub
---

Setting `list-style-position: outside` on `::footnote-marker` places the marker outside the footnote body[^1]. Continuation lines align with the body's left edge rather than under the marker[^2], which makes long footnotes easier to read.

[^1]: This note's number hangs to the left of the body. Continuation lines align with the left edge of the body, not under the number, producing a clean hanging indent.

[^2]: A second note with hanging indent applied.
```

</details>

<details>
<summary>VFM-generated HTML (body only)</summary>

```html
<p>Setting <code>list-style-position: outside</code> on <code>::footnote-marker</code> places the marker outside the footnote body<a id="fnref1" href="#fn1" class="footnote-ref" role="doc-noteref"><sup>1</sup></a>. Continuation lines align with the body's left edge rather than under the marker<a id="fnref2" href="#fn2" class="footnote-ref" role="doc-noteref"><sup>2</sup></a>, which makes long footnotes easier to read.</p>
<aside id="fn1" class="footnote" role="doc-footnote"><a href="#fnref1" class="footnote-back" role="doc-backlink"><sup>1</sup></a>This note's number hangs to the left of the body. Continuation lines align with the left edge of the body, not under the number, producing a clean hanging indent.</aside>
<aside id="fn2" class="footnote" role="doc-footnote"><a href="#fnref2" class="footnote-back" role="doc-backlink"><sup>2</sup></a>A second note with hanging indent applied.</aside>
```

</details>

Note that under Vivliostyle's DPUB-ARIA implementation the author's `::footnote-marker` `content` is rendered only when paired with **`list-style-position: outside`**. With `inside` (the CSS default) the author content is silently dropped — but the GCPM class form (`<span class="footnote">`) renders with either value. See the "About the footnote-area marker" callout in §5 for the underlying reason.

### Page-scoped reset and cross-scope counters

Footnote counters can now be reset per page group, which is useful for books that restart footnote numbering at each chapter. Use `counter-reset` together with the named-page mechanism described in the [Page Groups guide](./page-groups/).

### The three VFM `footnote` modes (VFM [PR#226](https://github.com/vivliostyle/vfm/pull/226), [PR#231](https://github.com/vivliostyle/vfm/pull/231))

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

### Object form of the VFM `footnote` option

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

### Per-file configuration via YAML frontmatter

The footnote mode can also be set per file in YAML frontmatter, overriding the global config:

```yaml
---
vfm:
  footnote: dpub  # or pandoc, gcpm
---
```

This is convenient when most of the project uses the project-wide default but a single file needs a different mode.

### Summary of CSS footnote properties

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
