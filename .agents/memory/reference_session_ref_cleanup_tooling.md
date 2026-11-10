---
name: reference-session-ref-cleanup-tooling
description: Claude Codeのrefs/sessions/*を安全に間引くスクリプトとlaunchd定期実行の設置場所
metadata: 
  node_type: memory
  type: reference
  originSessionId: 174fbeb2-99a7-49cf-ad0d-8450480e9e73
---

[project-git-corruption-session-refs](project_git_corruption_session_refs.md) の再発防止として設置した、リポジトリ非依存(全リポジトリ共通)のツール群。

- スクリプト本体: `~/.claude/scripts/prune-session-refs.sh`
  - 使い方: `prune-session-refs.sh <repo-path> [<repo-path> ...]`
  - 削除基準は「件数しきい値」ではなく「セッションの生死」: `refs/sessions/<uuid>/...` は、対応する `~/.claude/projects/<repoパスをtr '/.' '-'したslug>/<uuid>.jsonl` が存在しない場合にのみ削除する。まだ再開・rewind可能なセッションのrefは絶対に消さない設計。
- 定期実行: `~/Library/LaunchAgents/com.ogwata.claude.prune-session-refs.plist`(launchd、`StartInterval=86400`秒)。cronの固定時刻と違い、スリープで実行時刻を逃しても復帰後に自動で帳尻を合わせる。2026-07-17時点で、Claude Codeで実際に触れたことのある全リポジトリ(docs2.vivliostyle.org、vivliostyle.org、BookoPub/kikoyu-Booko・makoto・motoi-Booko・nagame、LLM/kikoyu・motoi・ndlocr-lite-web-ai・video-overlay-translator の計10件)を対象に追加済み。
  - 登録確認: `launchctl list | grep prune-session-refs`
  - 停止: `launchctl unload ~/Library/LaunchAgents/com.ogwata.claude.prune-session-refs.plist`
- ログ: `~/.claude/scripts/prune-session-refs.log`

**How to apply**: 新しいリポジトリでも同じ問題が起きうる。対象に加えたい場合はplistの `ProgramArguments` にリポジトリの絶対パスを追記し、`launchctl unload` → 編集 → `launchctl load` で反映する。このメモリは docs2.vivliostyle.org プロジェクト配下にのみ存在するため、他プロジェクトの会話では自動参照されない点に注意(ツール自体はグローバルに動作済みなので実害はないが、経緯の記録としては他プロジェクト側にも複製が必要な場合がある)。
