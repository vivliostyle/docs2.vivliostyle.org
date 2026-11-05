# 共有メモリ

- [文書変更を含むリリースだけを取り込む](upstream-document-release-only.md) — 文書差分のない上流更新と告知をしない。既存のClaude由来の記憶も確認する。
- [AI が作成したファイルを未処理のまま残さない](uncommitted-agent-files.md) — 未追跡の共有メモリも完了確認に含め、コミットまたは明示的な保留まで扱いを確定する。
- [作業を完了まで継続し、成果物全体を確認する](task-continuity-and-corrections.md) — 依頼目的から関連する成果物を列挙し、ユーザーの指摘後は具体的に修正・検証する。
- [要求された表示を実際に実現する](rendering-user-requested-content.md) — 画面表示の要望を文章の再掲と取り違えず、対象と表示形式を確認して実現する。
- [push 後はビルドと preview を更新してレビューする](preview-review-after-push.md) — push のたびにビルドし直して preview を再起動し、更新後の内容を表示してからレビューする。
- [Git のコミット・変更操作には事前説明と明示承諾が必要](commit-approval-current-rule.md) — コミットをAIの判断に任せる記述は旧規則。現在は `/Users/ogwata/dev/oboe/global/AGENTS.md` に従い事前説明と明示承諾を必須とする。

## ハンドオフの参照先

- 作業の引き継ぎ（ハンドオフ）は共通目次 `/Users/ogwata/dev/oboe/handoffs/INDEX.md` から探す。共通規則の正本は `/Users/ogwata/dev/oboe/global/AGENTS.md` にある。
