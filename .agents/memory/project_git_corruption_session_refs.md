---
name: project-git-corruption-session-refs
description: 2026-07-17、docs2.vivliostyle.org の .git がrefs/sessions肥大化で破損した事案の記録と対処法
metadata: 
  node_type: memory
  type: project
  originSessionId: 174fbeb2-99a7-49cf-ad0d-8450480e9e73
---

2026-07-17、SourceTreeで `git log` が `fatal: cannot read commit object ...` で失敗。原因は単一オブジェクトの欠損ではなく、`.git/objects/pack/multi-pack-index` と `commit-graph` が、既に削除された複数の古いパックファイルのオブジェクトを参照したまま残っていたこと。現存パック(1つ、約30MB)自体は `git verify-pack` で健全だった。

**根本原因**: `.git/packed-refs` に Claude Code のセッションチェックポイント用ref `refs/sessions/<uuid>/checkpoints/turn/<N>` が270件以上蓄積していた。この大量のrefがおそらく自動 `git gc`/repack を誘発し、それが完了前に中断された(古いパックを削除したが新パック・indexの更新が終わらなかった)ことで、multi-pack-index/commit-graphが「参照先はあるが実体がない」状態になった。

**Why**: `refs/sessions/*` は Claude Code の `/rewind` チェックポイント機能の内部実装と見られ、公式ドキュメント([checkpointing.md](https://code.claude.com/docs/en/checkpointing.md))には「ユーザープロンプト1件ごとにチェックポイント作成、直近100件のファイルスナップショットを保持、`cleanupPeriodDays`(既定30日)でセッション本体は自動クリーンアップ」とあるが、対応するGit refがこのクリーンアップで一緒に消えるかは非公式・未確認。実際には、セッションのトランスクリプト(`~/.claude/projects/<slug>/<uuid>.jsonl`)が既に存在しなくなった後もrefだけ残り続けていた。

**復旧手順**(データ損失なし。全ローカルブランチはGitHub上の対応コミットと一致していたため `git fetch origin --prune` で再構築可能だった):
1. `.git/objects/pack` と `packed-refs` をバックアップ
2. 実体を失っていた `multi-pack-index` と `objects/info/commit-graphs` を削除
3. `git fetch origin --prune` で全オブジェクトを再取得
4. 実体のない `refs/sessions/*` を `git update-ref -d` で削除
5. `git fsck --full` で健全性確認(`dangling` は正常な情報表示であり異常ではない)

**How to apply**: 他のリポジトリで同様に `git log`/`git status` が `cannot read commit object` 系のエラーで壊れた場合、まず `.git/packed-refs` に `refs/sessions/*` が大量に溜まっていないか確認する。恒久対策は [reference-session-ref-cleanup-tooling](reference_session_ref_cleanup_tooling.md) を参照。
