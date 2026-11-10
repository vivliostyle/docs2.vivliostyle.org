# 共有メモリ

- [文書変更を含むリリースだけを取り込む](upstream-document-release-only.md) — 文書差分のない上流更新と告知をしない。既存のClaude由来の記憶も確認する。
- [AI が作成したファイルを未処理のまま残さない](uncommitted-agent-files.md) — 未追跡の共有メモリも完了確認に含め、コミットまたは明示的な保留まで扱いを確定する。
- [作業を完了まで継続し、成果物全体を確認する](task-continuity-and-corrections.md) — 依頼目的から関連する成果物を列挙し、ユーザーの指摘後は具体的に修正・検証する。
- [要求された表示を実際に実現する](rendering-user-requested-content.md) — 画面表示の要望を文章の再掲と取り違えず、対象と表示形式を確認して実現する。
- [push 後はビルドと preview を更新してレビューする](preview-review-after-push.md) — push のたびにビルドし直して preview を再起動し、更新後の内容を表示してからレビューする。
- [Git のコミット・変更操作には事前説明と明示承諾が必要](commit-approval-current-rule.md) — コミットをAIの判断に任せる記述は旧規則。現在は全体指示に従い事前説明と明示承諾を必須とする。
- [変更前に説明と承認を求める](feedback_change_approval.md) — コードや成果物を変更する前に、何を／なぜ／どう変えるかを説明し承認を得る（コミットをAI判断とする記述は旧規則。現行は全体指示と [commit-approval-current-rule.md](commit-approval-current-rule.md)）
- [新規セクションの導線は必ず提案する](feedback_nav_default.md) — グローバルナビ・トップページ・パンくず等への掲載をスコープ外と独自判断しない
- [ユーザ署名で外部投稿する前に一次情報で裏取り](feedback_user_signed_posts.md) — Issue/PR/コメント等、ユーザの GitHub 名義で残る投稿は事実を一次情報で、自分の判断もスレッド内の他者の立場と矛盾しないか読み返してから
- [和欧間に半角スペースを挿入しない](feedback_jp_western_spacing.md) — モダンブラウザが 和欧間隔 を自動処理するため不要
- [自然な日本語表現を優先する](feedback_japanese_terms.md) — 「deprecated→非推奨」等、英語専門用語よりも既知の日本語訳を使う
- [Claudeっぽい表現を避ける](feedback_claude_like_writing.md) — 「Claudeっぽい」と感じさせた時点で失敗。直訳的比喩や「Xしつつ、Yができます」式の常套構文を避け、自然な日本語を優先
- [行番号にはファイル名を併記](feedback_line_numbers_with_filename.md) — `L146` だけでは曖昧。`ja の L146` や `path:146` のようにファイル名を必ず添える
- [略記・番号参照は初出で定義する](feedback_define_before_use.md) — 「セクション #1」等の番号略記は、初出時にフルパス＋スコープを必ず添える
- [執筆前にコードで動作確認](feedback_verify_before_writing.md) — 技術記事は推測でなく、動作確認したコードに基づいて書く
- [できること本位で直接書く](feedback_direct_writing.md) — 「何ができるか・どう書けばいいか」を最短で。見出しは趣旨が読み取れる動詞句に
- [情報提示直後に決断を迫らない](feedback_dont_rush_decisions.md) — 複数論点を一度に提示しつつ AskUserQuestion を連投しない。ユーザーが読み終え整理する時間を確保し、能動的に質問してくるのを待つ
- [委任された作業は自分で判断する](feedback_decide_dont_ask.md) — 曖昧さの解決は自分で行い確認質問を連発しない。ただしpush/投稿前の承認([[feedback_change_approval]])の代わりにはならない
- [ユーザーの業界知識を直接受け入れる](feedback_user_domain_knowledge.md) — ユーザーが提示する電子書籍出版業界等の固有知識は裏取りせず受け入れる
- [未検証の「揃える」修正をしない](feedback_no_unverified_consistency_edits.md) — 動いている値を一次情報で確認せず「表記統一」だけの理由で変更しない。指摘されていない“ついでの修正”を指摘対応と偽らない
- [Vivliostyle Viewer リンクのキャッシュ起因エラー](project_viewer_cache_issue.md) — docs.vivliostyle.org の .html/.json が Cloudflare キャッシュ対象外で GH Pages オリジンが遅く、Viewer リンクが断続エラー
- [refs/sessions肥大化によるgit破損事案](project_git_corruption_session_refs.md) — 2026-07-17、Claude Codeのチェックポイントrefが270件超蓄積しrepack中断で.git破損。origin再取得で復旧
- [セッションref間引きツールの設置場所](reference_session_ref_cleanup_tooling.md) — ~/.claude/scripts/prune-session-refs.sh とlaunchdによる全リポジトリ共通の定期クリーンアップ
- [submoduleは文書の変更を含むリリースのタグへ更新](project_submodule_update_timing.md) — doc/・docs/ の公開文書に変更があるリリースに限り、ブランチHEADではなくリリースのタグへ更新する。機能のバージョン表記も実リリースを調べて書く
- [上流起因の脆弱性はIssueを出さず待つ](project_upstream_vuln_no_issue.md) — cli・vfm が固定する依存のアラートは上流の対応待ち。Issue 作成を提案しない
- [Dependabotのlockfileがnpm 10系で落ちる](project_dependabot_lockfile_npm_mismatch.md) — CIのnpmと世代が違い `npm ci` が失敗。`npx npm@10.9.0 install --package-lock-only` で作り直す

## ハンドオフの参照先

- 作業の引き継ぎ（ハンドオフ）は全体指示が示す共通目次から探す。共通規則の正本は全体指示にある。
