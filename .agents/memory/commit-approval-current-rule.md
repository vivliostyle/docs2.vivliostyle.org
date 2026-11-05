---
name: Git のコミット・変更操作には事前説明と明示承諾が必要
description: コミットを AI の判断に任せる規則は旧規則であり、現在は Git の状態を変更する全操作に事前説明とユーザーの明示的な承諾が必要
metadata:
  type: feedback
---

## 現行の規則

Git の状態を変更する操作（ブランチ作成、コミット、マージ、push、ブランチや worktree の削除など）を AI が直接実行する場合は、実行前に目的、対象、具体的な操作、影響範囲、想定される結果、リスク、取り消しや復旧の方法を説明し、ユーザーの明示的な承諾を得る。
承諾を得るまでは実行しない（正本：`/Users/ogwata/dev/oboe/global/AGENTS.md`）。

## 過去の記録との区別

Claude Code の私有メモリ `/Users/ogwata/.claude/projects/-Users-ogwata-dev-vivliostyle-docs2-vivliostyle-org/memory/feedback_change_approval.md` にある「コミットまでは自分の判断で進めてよい」という記述は過去の記録（旧規則）であり、現在は適用しない。
記憶ファイルに書かれた Git 操作の扱いは、全体指示 `/Users/ogwata/dev/oboe/global/AGENTS.md` の承諾規則より優先しない。
