# AGENTS.md

This file is for any AI coding agent working in this repository. Keep
changes focused, preserve existing behavior unless the task explicitly asks
for a change, and prefer the project's established patterns over new
abstractions. See [README.md](README.md) / [README.ja.md](README.ja.md) for
the project overview, directory structure, and build commands.

## 共有メモリの入口

- 作業開始時に共有メモリの目次 [`.agents/memory/MEMORY.md`](.agents/memory/MEMORY.md) と、依頼に関係する記憶ファイルを読む。ユーザーから指摘・訂正・好みを受けた場合は `.agents/memory/` に記録し、目次を更新する（詳細は [`.clinerules/01-記憶.md`](.clinerules/01-記憶.md) を参照）。

## 作業の継続と変更ファイルの完了確認

- 開始時と完了報告前に `git status --short --untracked-files=all` を実行し、既存の変更と今回 AI が作成・変更したファイルを区別する。`git diff` が空でも、未追跡ファイルを含めて確認するまでは「変更なし」と報告しない。
- 共有メモリも成果物として扱う。今回 AI が作成・変更した全ファイルについて、コミット済み、具体的な対象を示した承諾待ち、またはユーザーが明示した保留のいずれかに扱いを確定する。PR から外す場合も別コミットなどの処理先を提案し、独断でローカル専用にしない。残件を隠すために ignore 設定や削除を使わない。
- 調査、対策の記録、編集、コミットなどの途中の節目で終了せず、当初の依頼の完了条件と残作業を照合する。承諾待ちの間も依存しない調査・準備・検証を進め、承諾を得たら同じ目的に戻って実行・検証まで続ける。
- 承諾が必要な場合は、準備済みの具体案、対象、影響、リスクと復旧方法をまとめて提示して承諾を求める。説明や反省だけで終了して、ユーザーに「続けて」と指示させない。
- コミット後も status とコミット内容を確認し、承諾された対象の収録と残る変更の扱いを報告する。既存の他者の変更は承諾なくコミット・削除しない。記憶への書き込みが承諾不要でも、Git 操作の承諾は別途必要である。

この手順は、2026-11-03 にユーザーが承認した再発防止策による。経緯は [`.agents/memory/uncommitted-agent-files.md`](.agents/memory/uncommitted-agent-files.md) を参照する。

## 上流ドキュメントの更新条件

- 上流の取り込み対象は、`doc/` または `docs/` 配下の公開ドキュメントに変更を含むリリースに限る。
- リリースの有無と、現在取り込んでいる版から対象リリースまでの文書差分を確認してから、更新の要否を判断する。
- プログラムの修正、バージョン番号の変更、上流のコミットの進行だけでは取り込まない。未リリースの変更も取り込まない。
- 文書に変更がなければ「ドキュメントの更新なし」と報告し、サブモジュール参照、トップページ、変更履歴、生成物を更新しない。
- 文書に変更がある場合に限り、その内容に応じて関連ページ、更新案内、生成物を更新する。

## Generative AI Policy

This project discloses its generative AI usage in
[`AI_POLICY.md`](AI_POLICY.md), following NLnet's generative AI policy. (A
Japanese translation is [`AI_POLICY.ja.md`](AI_POLICY.ja.md), for human
readers; agents should read the English version.) Agents must follow that
policy:

- Add an `Assisted-by:` trailer naming the agent and the exact model version
  to every commit that contains AI-generated changes, in the Linux-kernel
  format `Assisted-by: AGENT_NAME:MODEL_VERSION`, e.g.
  `Assisted-by: Claude Code:claude-sonnet-5`. It does not need to be the
  last trailer. Tool-added `Co-authored-by:` trailers (e.g. from GitHub
  Copilot on PR review commits) are also accepted as disclosure.
- When drafting a pull request description, include the same
  `Assisted-by:` line in the body, and describe the human/AI division of
  labor (what was delegated to the AI, and what the human contributor
  designed, decided, reviewed, and verified) inside a `<details>` block,
  following the example in `AI_POLICY.md`.
- Never emit content — code or prose — that reproduces third-party
  copyrighted material.
- Before writing documentation content, verify technical claims against the
  actual source (running code, or the upstream repositories under
  `submodules/`) rather than writing from assumption.
- When translating or rewriting bilingual content, preserve the source's
  technical meaning exactly — do not introduce behavior, defaults, or claims
  the source doesn't support, even if the result reads more fluently.
- Write natural Japanese and English prose. Avoid AI-typical phrasing —
  literal-translation idioms, formulaic constructions, hedging filler that
  adds no information. Prefer established terminology (including natural
  Japanese equivalents for common English technical terms) over stiff
  transliteration, except where the English term is the ecosystem standard.
- When a change adds a new page or section, explicitly propose its
  navigation entry points (global nav, top page, breadcrumbs) for review
  instead of treating them as out of scope.
- Do not make "consistency" edits to working values or wording without
  verifying against a primary source.
