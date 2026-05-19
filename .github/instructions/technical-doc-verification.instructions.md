---
description: Protocol for verifying technical claims when writing or reviewing Vivliostyle documentation
applyTo: 'content/**/*.md'
---

# Technical Claim Verification Protocol

When writing or reviewing documentation about Vivliostyle.js/CLI behavior, technical claims fall into categories with different verifiability. Failing to distinguish these led to incorrect documentation that misled reviewers (PR #17, 2026-05).

## Claim Categories

| Category | Examples | AI can verify? |
|---|---|---|
| Code structure / existence | Function name, property name, class hierarchy | ✅ Yes — use grep/view |
| Spec / standard text | W3C spec wording, EPUB spec references | ✅ Yes — fetch the URL |
| Config / option names | `vivliostyle.config.js` keys, CLI flags | ✅ Yes — check source/docs |
| **Actual rendering / visual behavior** | "This CSS produces this layout", "This property renders X" | ❌ **No — requires live test** |

## Rules

### When writing docs with rendering behavior claims

1. You can write what the **code path suggests** should happen.
2. Always flag unverified rendering claims inline:
   ```
   <!-- TODO: 要実機確認 — 以下の描画動作は未テスト -->
   ```
3. Never state rendering behavior as confirmed fact unless a human reviewer has tested it.

### When asked to "verify" technical claims

- Clearly state which category each claim falls into.
- For rendering behavior: report **"コード上は該当する処理が存在するが、実際の描画動作の確認には実機テストが必要です"** — do not report "問題なし".
- Do not look for evidence that supports the claim; actively look for contradictions too.

### Before declaring review complete

Ask explicitly:
- Does this document contain claims about rendering/visual behavior?
- Have those claims been tested in Vivliostyle Viewer by a human?

If no → state "実機未確認の描画動作記述が含まれます" in the PR comment.

## External Posts Require Prior Approval

Before posting any comment to GitHub (PR comments, issue comments) or making any commit that will be publicly visible, **always show the draft to the user first** and wait for explicit approval.

- ✅ "こちらの文案でよろしいですか？" → wait for confirmation → then post
- ❌ Composing and posting in the same turn without showing the draft

This applies to: PR/issue comments, commit messages (when non-trivial), and any other externally visible action.

## Learnings

### 2026-05 PR #17 — `list-style-position` / `::footnote-marker` error

**What happened**: The doc claimed `::footnote-marker` content only renders when paired with `list-style-position: outside` in DPUB-ARIA footnotes. A prior AI verification pass reported "問題なし". MurakamiShinyu (core developer) stated this was wrong: "何かの間違いでしょう。そのようなことはないはずです。"

**Root cause**: The AI found a conditional code branch that *could* produce this behavior and concluded the documented behavior was correct, without live testing. The same pattern was flagged earlier by reviewers u1f992 and spring-raining.

**Correct approach**: Any claim of the form "X CSS property requires Y to work" or "without Z, the content is not rendered" is a rendering behavior claim and **must be flagged for live testing**, not verified by code reading alone.
