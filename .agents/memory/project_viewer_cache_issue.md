---
name: project-viewer-cache-issue
description: docs.vivliostyle.org の Vivliostyle Viewer リンクが断続エラーになる問題と Cloudflare Cache Rule 依頼の進行状況
metadata: 
  node_type: memory
  type: project
  originSessionId: ba950285-9bae-4b7d-9b6a-2992e8b0aae0
---

docs.vivliostyle.org の各ドキュメントページに設置された「Vivliostyle Viewer で開く」リンクが、JA/EN 全 12 publication で断続的にエラー（404 / 520 / "target resource is invalid"）を出す。

**根本原因**: Cloudflare が `.html` / `.json` をデフォルトでキャッシュせず（`cf-cache-status: DYNAMIC`）、GitHub Pages オリジンの TTFB が最大 44 秒まで延びるためブラウザの fetch がタイムアウトする。静的アセット（.svg / .css）は `cache-control: max-age=14400` で `cf-cache-status: HIT` になり問題なし。Vivliostyle Viewer は書籍 1 冊あたり publication.json + readingOrder の HTML 約 10 個 = 11 リクエストを都度 fetch するため、1 つでもタイムアウトするとロード失敗。

**Why**: PR #17（Cookbook セクション追加）で LiveView ボタンの設置箇所が増えたことで、潜在していたインフラ側遅延が顕在化した。PR #17 自体が原因ではない。

**How to apply**: 2026-05-21 時点で、ユーザは Cloudflare の vivliostyle.org ゾーン管理権限を持たないため、Slack で他のメンテナに Cache Rule 追加を依頼予定。依頼内容は `/publications/*` を Edge cache TTL 1 hour で eligible にする。適用後、こちらで `cf-cache-status: HIT` を確認し、保険として GitHub Actions の cron 1 時間ごとの cache warming（`.github/workflows/warm-cache.yml`）を実装する段取り。Slack 依頼の進行状況や Cloudflare 適用結果は次回会話時に確認する。

関連: [[feedback-change-approval]]
