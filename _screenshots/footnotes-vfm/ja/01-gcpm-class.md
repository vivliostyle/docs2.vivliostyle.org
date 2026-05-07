---
title: "例1: HTML直書き脚注（GCPMクラス方式）"
vfm:
  footnote: gcpm
---

HTML中に`<span class="footnote">`として記述した脚注[^1]は、テーマCSS（theme-base / theme-techbookなど）の`.footnote { float: footnote }`によってページ下部の脚注エリアに送られる。

本文中に複数の参照を入れた場合[^2]でも、マーカーは`::footnote-call`と`::footnote-marker`擬似要素で連番つきに生成される。

[^1]: 脚注の本文。`float: footnote`によりレイアウト時にページ下部に移動される。

[^2]: もう一つの注。連番は自動的に振られる。
