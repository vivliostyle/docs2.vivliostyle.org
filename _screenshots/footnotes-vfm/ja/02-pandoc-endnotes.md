---
title: "例2: VFM Pandoc形式の後注"
vfm:
  footnote: pandoc
---

VFMのデフォルト設定（`footnote: 'pandoc'`）では、`[^1]`記法は`<section role="doc-endnotes">`として本文末尾に追加される[^1]。

本文と通常フローでつながるため、`float: footnote`や`@page { @footnote { } }`の対象にならない[^2]点に注意。

[^1]: 最初の後注の本文。

[^2]: 次の後注の本文。
