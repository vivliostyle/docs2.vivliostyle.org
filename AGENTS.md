# AGENTS.md

This file is for any AI coding agent working in this repository. Keep
changes focused, preserve existing behavior unless the task explicitly asks
for a change, and prefer the project's established patterns over new
abstractions. See [README.md](README.md) / [README.ja.md](README.ja.md) for
the project overview, directory structure, and build commands.

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
