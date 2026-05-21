---
title: "例3: DPUB-ARIA脚注（テーマCSSなし）"
vfm:
  footnote: dpub
---

本文中に`[^1]`と書くと、VFM dpubモードは`<a role="doc-noteref">`[^1]と`<aside role="doc-footnote">`を出力する。

Vivliostyle.js v2.41.0+のビルトインUAスタイルが`float: footnote`を自動で適用するため、テーマCSSなしでもページ下部の脚注エリアに配置される[^2]。

[^1]: 脚注の本文。CSSは何も書いていない。

[^2]: もう一つの注。連番は自動。
