---
title: CMYK Conversion Guide
description: device-cmyk() and CLI PDF CMYK output
lang: en
order: 3
---

# CMYK Conversion Guide

> **Target versions**: Vivliostyle.js v2.40.0+ (released 2026-01-11), Vivliostyle CLI v10.5.0+
> **Published**: 2026-05-05
> **Last updated**: 2026-05-05

This guide covers CMYK colour authoring on the CSS side via `device-cmyk()`, and CMYK PDF output on the CLI side via `pdfPostprocess.cmyk`.

## 1. Why CMYK matters in print PDFs

Commercial offset printing uses four process inks: **Cyan**, **Magenta**, **Yellow**, and **Key (black)**. Print shops require PDFs whose colours are specified directly in the CMYK colour space, because RGB-to-CMYK conversion happens differently in every workflow and producing a PDF in CMYK upfront is the only way to control the result deterministically.

Until v2.39.x, Vivliostyle could only emit RGB. v2.40.0 introduces:

- The CSS function `device-cmyk()` for direct CMYK colour authoring
- CLI post-processing (`pdfPostprocess.cmyk`) that converts the generated RGB PDF into a CMYK PDF, with custom RGB→CMYK mapping rules

Together, they make it possible to author and produce print-ready PDFs entirely from Vivliostyle.

## 2. The `device-cmyk()` CSS function

`device-cmyk()` is defined in [CSS Color 5](https://drafts.csswg.org/css-color-5/#device-cmyk).

### Basic syntax

```css
color: device-cmyk(0 1 1 0);            /* process red (M=Y=100%) */
color: device-cmyk(100% 0% 0% 0%);      /* pure cyan, percentage form */
color: device-cmyk(0 0 0 1);            /* pure black */
```

Channels are listed in the order **C, M, Y, K**. Each channel is a number `0..1` or a percentage `0%..100%`.

### Legacy comma-separated syntax

For compatibility with the legacy CSS3 syntax, comma-separated arguments are also accepted:

```css
color: device-cmyk(0, 1, 1, 0);
```

### Alpha channel

A trailing alpha can be supplied with `/`:

```css
background-color: device-cmyk(0 1 1 0 / 0.5);
```

## 3. Using `device-cmyk()` across CSS properties

`device-cmyk()` works wherever a `<color>` value is expected:

```css
h1 { color: device-cmyk(0 0 0 1); }                     /* text */
.callout {
  background-color: device-cmyk(0 0.1 0.2 0);           /* fills */
  border: 1pt solid device-cmyk(0 0.5 1 0.1);           /* borders */
  background-image: linear-gradient(
    device-cmyk(1 0 0 0),
    device-cmyk(0 0 0 0)
  );                                                     /* gradients */
}
@page {
  background: device-cmyk(0 0 0.05 0);                  /* page backgrounds */
}
```

## 4. Practical process-colour examples

| Use case | CMYK | Notes |
|---|---|---|
| Rich black (deep black for large solid areas) | `device-cmyk(0.4 0.3 0.3 1)` | Avoids the slightly grey look of K-only black on coated stock |
| Process red | `device-cmyk(0 1 1 0)` | M=Y=100% |
| Process green | `device-cmyk(1 0 1 0)` | C=Y=100% |
| Process blue | `device-cmyk(1 1 0 0)` | C=M=100% |
| Pale fill (for boxes / highlights) | `device-cmyk(0 0.1 0.2 0)` | Light warm tint |

## 5. CLI CMYK PDF output

`device-cmyk()` produces a PDF whose colour-space objects are CMYK at the CSS-author-controlled level. But Vivliostyle CLI still emits RGB by default for everything else — page background, embedded images, etc. To convert the whole PDF into a CMYK PDF, configure the CLI's post-processing:

```js
// vivliostyle.config.js
export default {
  // ...
  pdfPostprocess: {
    cmyk: {
      // Convert the output PDF to CMYK after Vivliostyle generates it
      enabled: true,
    },
  },
};
```

Internally this runs Ghostscript with a colour-conversion device, transforming all colour-space objects in the PDF to DeviceCMYK.

## 6. Custom RGB→CMYK mapping (`overrideMap`)

The default RGB→CMYK conversion uses a generic profile, which is rarely what a print shop expects. The CLI lets you override specific RGB colours with hand-tuned CMYK values:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    overrideMap: [
      // Convert the brand orange (#FF6633) to a tuned CMYK value
      { from: '#FF6633', to: 'cmyk(0, 70, 90, 0)' },
      // Cover key brand colours
      { from: '#003366', to: 'cmyk(100, 80, 20, 40)' },
    ],
  },
},
```

This is particularly useful for:

- **SVG content** authored in RGB
- **Raster images** that contain logo / spot colours
- **CSS values that aren't authored as `device-cmyk()`** (e.g. third-party themes)

## 7. Debug colour map (`mapOutput`)

To audit which colours were converted, write the map to a file:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    mapOutput: './cmyk-map.txt',
  },
},
```

The output records each unique RGB colour found in the source PDF together with the CMYK value it was converted to.

## 8. Image replacement (`replaceImage`)

Some workflows separate Web and print versions of images (e.g. RGB JPEG for web, pre-converted CMYK TIFF for print). The CLI can swap an image at PDF post-processing time:

```js
pdfPostprocess: {
  cmyk: {
    enabled: true,
    replaceImage: [
      { match: 'cover.jpg', with: 'cover-print.tiff' },
    ],
  },
},
```

## 9. Limitations and caveats

- **Gradients and image effects**: gradients between colours and certain image-filter effects may not round-trip perfectly through the CMYK conversion. Confirm visually before sending to print.
- **Spot colours**: `device-cmyk()` does not address spot inks (Pantone, DIC). If you need spot colour separation, that has to be handled by the print shop or via a separate PDF post-processing step.
- **Soft proofing**: the result is a *device-cmyk* PDF. Whether the actual print matches your screen depends on the shop's CMYK profile, which is outside Vivliostyle's responsibility.

## 10. Build and verification

To check ink coverage on the generated PDF, use Ghostscript with an `inkcov` device:

```sh
gs -o - -sDEVICE=inkcov mybook.pdf
```

This prints the per-page ink coverage as four numbers (C M Y K) in the range 0..1, which lets you confirm the printer-relevant per-channel ink amounts.

## References

- W3C [CSS Color 5 — `device-cmyk()`](https://drafts.csswg.org/css-color-5/#device-cmyk)
- CLI example: `vivliostyle-cli/examples/cmyk/`
- Test case: `vivliostyle.js/packages/core/test/files/device-cmyk/test.html`
