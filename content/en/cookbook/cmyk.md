---
title: CMYK Conversion Guide
description: device-cmyk() and CLI PDF CMYK output
lang: en
order: 3
---

# CMYK Conversion Guide

> **Target versions**: Vivliostyle.js v2.40+ (released 2026-01-11), Vivliostyle CLI v10.6+
> **Published**: 2026-05-05
> **Last updated**: 2026-05-16

This guide explains the mechanics and limitations of the `device-cmyk()` CSS function and `pdfPostprocess.cmyk`.

## What this feature can and cannot do

Vivliostyle CLI drives Chromium to generate PDFs. Because web browsers have no native support for CMYK colour spaces, every colour in the PDF that Chromium produces is DeviceRGB. This feature adds a post-processing step that uses MuPDF to scan the PDF content stream and replace DeviceRGB colour operators (`rg`/`RG`) with DeviceCMYK colour operators (`k`/`K`).

![CMYK conversion flow overview](/cookbook/cmyk/flow-en.svg)

Here is what is and is not converted:

**Converted** (output as DeviceRGB colour operators):
- Text colour (`color` property)
- Solid fills and borders (`background-color`, `border-color`)
- Solid fills in SVG vector elements (via `reserveMap`)

**Not converted** (written to the PDF via mechanisms other than DeviceRGB operators):
- **Raster images** (JPEG, PNG, etc.) — prepare pre-converted CMYK image files and swap them with `replaceImage`
- **Gradients** (`linear-gradient()`, etc.) — Chromium outputs these as PDF Shading Objects, which are out of scope for the operator replacement
- **Filters, blend modes, etc.** — expressed via transparency groups and other mechanisms, not plain operators

In short, this is a deliberately scoped implementation: it handles **text and solid vector fills**, leaving raster images to existing CMYK conversion solutions. Practical use requires keeping your CSS to simple solid colour declarations and having pre-converted image assets ready.

If your print shop accepts RGB submissions, that route is often more straightforward.

## Background: PDF colour operators

Understanding how this feature works requires some knowledge of PDF colour operators.

PDF content streams support a shortcut notation where a single operator both selects the colour space and sets the colour value. Because the colour space is implied by the operator name itself, no separate colour space declaration is needed. These are called **implicit colour operators**.

| Operator | Colour space | Applies to |
|---|---|---|
| `rg` (lowercase) | DeviceRGB | fill |
| `RG` (uppercase) | DeviceRGB | stroke |
| `k` (lowercase) | DeviceCMYK | fill |
| `K` (uppercase) | DeviceCMYK | stroke |

Chromium outputs text and solid fills using `rg`/`RG` operators. Vivliostyle CLI's post-processing replaces `rg` with `k` and `RG` with `K`. Because the argument count changes from three (RGB) to four (CMYK), a mapping from RGB values to CMYK values is required — that is what `reserveMap` and `overrideMap` provide.

## The `device-cmyk()` CSS function

`device-cmyk()` is defined in [CSS Color 5](https://drafts.csswg.org/css-color-5/#device-cmyk).

### How it works

Because Vivliostyle runs inside a web browser, `device-cmyk()` is converted at CSS-processing time to `color(srgb r g b)`, and the RGB–CMYK correspondence is stored in CmykStore. The actual CMYK substitution happens later in the CLI post-processing step.

### Basic syntax

```css
color: device-cmyk(0 1 1 0);            /* process red (M=Y=100%) */
color: device-cmyk(100% 0% 0% 0%);      /* pure cyan, percentage form */
color: device-cmyk(0 0 0 1);            /* pure black */
```

Channels are listed in **C, M, Y, K** order. Each channel is a number `0..1` or a percentage `0%..100%`. The legacy comma-separated syntax from CSS3 is also accepted.

### Constraints on where CMYK conversion applies

`device-cmyk()` can be written wherever a `<color>` value is accepted, but CMYK conversion only takes effect where the resulting RGB value appears as a `rg`/`RG` operator directly in the PDF content stream. Solid `color`, `background-color`, and `border-color` declarations generally qualify; gradients do not, because Chromium outputs them as Shading Objects. Avoid using `device-cmyk()` inside gradient functions.

```css
/* OK: converted to CMYK */
h1 { color: device-cmyk(0 0 0 1); }
.box { background-color: device-cmyk(0 0.1 0.2 0); }
.box { border: 1pt solid device-cmyk(0 0.5 1 0.1); }

/* NG: not converted (gradient becomes a Shading Object) */
.box {
  background-image: linear-gradient(
    device-cmyk(1 0 0 0),
    device-cmyk(0 0 0 0)
  );
}
```

### Alpha values

A trailing alpha can be appended with `/`, but alpha is handled by a separate mechanism from colour operators. The replacement process ignores alpha, so an alpha-bearing `device-cmyk()` value may not be converted to CMYK as expected.

## Practical process-colour examples

| Use case | CMYK | Notes |
|---|---|---|
| Rich black (deep black for large solid areas) | `device-cmyk(0.4 0.3 0.3 1)` | Avoids the slightly grey look of K-only black on coated stock |
| Process red | `device-cmyk(0 1 1 0)` | M=Y=100% |
| Process green | `device-cmyk(1 0 1 0)` | C=Y=100% |
| Process blue | `device-cmyk(1 1 0 0)` | C=M=100% |
| Pale fill (for boxes / highlights) | `device-cmyk(0 0.1 0.2 0)` | Light warm tint |

## CLI CMYK PDF output

### Enabling

```js
// vivliostyle.config.js
export default {
  pdfPostprocess: {
    cmyk: true,   // or cmyk: {} (equivalent)
  },
};
```

The default is `false`. When `false`, CMYK substitution does not run — not even for colours authored with `device-cmyk()`.

### How the post-processing works

Post-processing is carried out by MuPDF. It scans the PDF content stream and replaces DeviceRGB colour operators (`rg`/`RG`) with DeviceCMYK colour operators (`k`/`K`). The RGB-to-CMYK mapping is built from values recorded in CmykStore during `device-cmyk()` processing, combined with whatever is specified in `reserveMap` and `overrideMap`.

## Handling RGB colours that originate outside CSS: `reserveMap`

The fill colours of SVG vector elements are written directly to the PDF as RGB by Chromium and cannot be targeted with `device-cmyk()`. Use `reserveMap` to register RGB→CMYK entries in CmykStore before CSS processing begins.

```js
pdfPostprocess: {
  cmyk: {
    reserveMap: [
      ['#FF6633', { c: 0, m: 7000, y: 9000, k: 0 }],
      ['#003366', { c: 10000, m: 8000, y: 2000, k: 4000 }],
    ],
  },
},
```

**Entry format**: an array of `[rgb, { c, m, y, k }]` tuples.

**Value scale**: CMYK and RGB values are both **integers in the range 0–10000** (10000 = 100%, minimum unit 0.0001%). This representation avoids floating-point precision issues in JavaScript.

**RGB keys**: hex strings such as `'#FF6633'` are accepted and normalised to the 0–10000 scale by a Chromium-compatible conversion.

## Last resort: `overrideMap`

`overrideMap` is an escape hatch for colours that neither `reserveMap` nor `device-cmyk()` can reach — for example, RGB values in internally generated invisible elements. At post-processing time it is merged on top of the final CmykStore map.

The entry format and value scale are the same as `reserveMap`. Colours already covered by `reserveMap` will not appear in warnings, so there is no reason to list them again in `overrideMap`.

## Detecting unmapped colours: `warnUnmapped`

After post-processing, any DeviceRGB operators still remaining in the PDF trigger a warning. Because the PDF cannot distinguish CSS-originated colours from SVG-originated ones, all remaining RGB colours are reported.

```js
pdfPostprocess: {
  cmyk: {
    warnUnmapped: true,
  },
},
```

The typical workflow is to add each colour that appears in the warnings to `reserveMap`.

## Practical workflow

1. Limit CSS colour usage to solid declarations (`color`, `background-color`, `border`) and author them with `device-cmyk()`
2. Prepare pre-converted CMYK image assets (swap them with `replaceImage`)
3. Register SVG vector colours in `reserveMap`
4. Enable `warnUnmapped: true`, build, and add any warned colours to `reserveMap`
5. Verify ink coverage with Ghostscript `inkcov`

## Image replacement: `pdfPostprocess.replaceImage`

`replaceImage` is independent of `cmyk` and works even when `cmyk: false`.

```js
pdfPostprocess: {
  replaceImage: [
    { source: 'cover.jpg', replacement: 'cover-print.tiff' },
    { source: /^images\/web-(.+)\.jpg$/, replacement: 'images/print-$1.tiff' },
  ],
},
```

- `source`: a string or JavaScript regular expression
- `replacement`: the replacement file path
- Both paths are resolved relative to the entry context directory (`entryContextDir`, defaulting to `.`)

## Verification

To check ink coverage on the generated PDF, use Ghostscript with the `inkcov` device:

```sh
gs -o - -sDEVICE=inkcov mybook.pdf
```

This prints per-page ink coverage as four numbers (C M Y K) in the range 0..1. Any non-zero value for C, M, or Y on a page that should be black-only indicates an unintended ink channel.

## References

- W3C [CSS Color 5 — `device-cmyk()`](https://drafts.csswg.org/css-color-5/#device-cmyk)
- CLI example: [`vivliostyle-cli/examples/cmyk/`](https://github.com/vivliostyle/vivliostyle-cli/tree/main/examples/cmyk)
