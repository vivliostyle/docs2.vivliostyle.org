---
title: "Example 3: DPUB-ARIA footnote (no theme CSS)"
vfm:
  footnote: dpub
---

Writing `[^1]` in the body causes VFM's dpub mode to emit `<a role="doc-noteref">`[^1] in-text and `<aside role="doc-footnote">` separately.

Vivliostyle.js v2.41.0+ applies `float: footnote` automatically through its built-in UA stylesheet, so the note is placed in the page-bottom area without any theme CSS[^2].

[^1]: The footnote body. No CSS has been written for this rendering.

[^2]: A second note. Numbering is automatic.
