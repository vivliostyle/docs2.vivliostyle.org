---
name: feedback-line-numbers-with-filename
description: 行番号を伝えるときはファイル名を必ず併記する
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ba950285-9bae-4b7d-9b6a-2992e8b0aae0
---

行番号（`L146`, `L189-193` など）を言及するときは、必ずファイル名を併記する。

**Why**: 行番号だけだと、ユーザーがどのファイルの話か分からない。特に ja/en パラレル翻訳がある場合、同じ行番号が複数ファイルに存在しうるため、ファイル名なしでは曖昧。長い会話の中で前提となるファイルが揺れている場合も多く、明示しないと誤解の元になる。

**How to apply**:
- `L146` ではなく `content/ja/cookbook/responsive-and-nesting.md:146`、または「ja の L146」のように書く
- 複数言語の同等箇所を指すときも明示する。例: 「ja の L146 / en の L146」
- Markdown では `[filename:N](path#LN)` のクリック可能リンクが望ましい

関連: [[feedback-change-approval]]
