---
title: "Example 2: VFM Pandoc-style endnotes"
vfm:
  footnote: pandoc
---

VFM's default setting (`footnote: 'pandoc'`) renders `[^1]` as a `<section role="doc-endnotes">` appended to the end of the document[^1].

Because endnotes flow inline with the main text, they are not subject to `float: footnote`, and `@page { @footnote { } }` styling has no effect on them[^2].

[^1]: First endnote body.

[^2]: Second endnote body.
