---
name: project_submodule_update_timing
description: docs2.vivliostyle.org の submodule は、doc/・docs/ の公開文書に変更を含む上流リリースに限り、リリース時点のタグへ更新する（2026-11-10 の注記）
metadata: 
  node_type: memory
  type: project
  originSessionId: 898d2d4b-a408-4c17-a864-49a4d270ee21
  modified: 2026-08-24T12:46:26.233Z
---

> 注記（2026-11-10）：上流のリリースがあっても、それだけでは submodule を更新しない。このリポジトリの `AGENTS.md` の「上流ドキュメントの更新条件」と `upstream-document-release-only.md` に従い、今取り込んでいる版から対象リリースまでに `doc/`・`docs/` の公開文書の変更があるときに限って、リリース時点のタグへ更新する。

docs2.vivliostyle.org の submodule は、上流で新バージョンがリリースされた直後に、ブランチ HEAD ではなく**リリース時点のタグ**へ更新する。2026-08-24 の PR #61 レビューで村上真雄氏が示した方針。

**Why:** 各プロジェクトのドキュメントは機能の実装と同時に更新されるため、submodule のブランチ HEAD には未リリースの機能の記述が含まれる。それをサイトに載せると、読者が現行リリースでは動かない書き方を真似てしまう。実際に themes で、theme-base 2.1.1 未収録のスタイルシート構成（`css/` 直下へのフラット化）の `@import` 記述例が混入していた。

**How to apply:** 更新時は `git tag --contains <commit>` で対応リリースを確認する。変更履歴に機能を書くときも、submodule のバージョンではなくその機能が実際に入ったリリース番号を書く（例: CSS Nesting は収録時点の v2.44.1 ではなく v2.42.0）。運用は定期実行タスク「Vivliostyle doc watch」が担う（2026-08-25 朝から毎日）。関連: [[feedback_verify_before_writing]]
