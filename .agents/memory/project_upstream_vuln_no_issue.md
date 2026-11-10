---
name: project-upstream-vuln-no-issue
description: 上流の Vivliostyle パッケージ（cli・vfm）が固定している依存の脆弱性アラートは、Issue を出さず上流の対応を待つ
metadata:
  node_type: memory
  type: project
  originSessionId: 4889195d-0412-4286-a203-1a25fad9c91b
  modified: 2026-10-07T12:58:15.550Z
---

docs2.vivliostyle.org の Dependabot アラートのうち、@vivliostyle/cli や @vivliostyle/vfm がバージョンを固定しているために直せないもの（2026-10-07 時点で trim、prismjs、dompurify、valibot、uuid など）は、上流に Issue を出さず、上流の対応を待つ。2026-10-07 に小形さんが「今後も同じ方針」と指示した。

**Why:** 上流の対応を待つと小形さんが判断したため。

**How to apply:** 依存 PR の対処で残ったアラートを報告するとき、上流へ Issue を出すかどうかを尋ねたり、下書きを作ると申し出たりしない。lockfile の更新だけで直せるもの（既存の semver 範囲に修正版があるもの）は、これまでどおりこちらで対処する。関連: [[project-dependabot-lockfile-npm-mismatch]]
