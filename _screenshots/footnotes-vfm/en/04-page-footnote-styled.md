---
title: "Example 4: Custom styling via @page { @footnote { … } }"
vfm:
  footnote: dpub
---

This example styles the footnote area with `@page { @footnote { … } }`[^1], applying a top border, padding, and a generated "Notes" heading via `::before`.

With multiple notes[^2], the heading appears once for the entire footnote area, not per note.

[^1]: A styled footnote.

[^2]: A second styled footnote.
