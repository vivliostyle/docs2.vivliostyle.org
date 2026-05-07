---
title: "Example 7: ::footnote-marker with list-style-position: outside"
vfm:
  footnote: dpub
---

Setting `list-style-position: outside` on `::footnote-marker` places the marker outside the footnote body[^1]. Continuation lines align with the body's left edge rather than under the marker[^2], which makes long footnotes easier to read.

[^1]: This note's number hangs to the left of the body. Continuation lines align with the left edge of the body, not under the number, producing a clean hanging indent.

[^2]: A second note with hanging indent applied.
