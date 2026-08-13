# AGENTS.md

This file is for any AI coding agent working in this repository. Keep
changes focused, preserve existing behavior unless the task explicitly asks
for a change, and prefer the project's established patterns over new
abstractions. See [README.md](README.md) / [README.ja.md](README.ja.md) for
the project overview, directory structure, and build commands.

## Generative AI Policy

This project discloses its generative AI usage in
[`AI_POLICY.md`](AI_POLICY.md) (English) and
[`AI_POLICY_ja.md`](AI_POLICY_ja.md) (Japanese), following NLnet's
generative AI policy. Agents must follow that policy:

- Add an `Assisted-by:` trailer naming the agent and the exact model version
  to every commit that contains AI-generated changes, in the Linux-kernel
  format `Assisted-by: AGENT_NAME:MODEL_VERSION`, e.g.
  `Assisted-by: Claude Code:claude-sonnet-5`. Do not add a `Co-authored-by:`
  trailer for the AI.
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
- When a change adds a new page or section, explicitly propose its
  navigation entry points (global nav, top page, breadcrumbs) for review
  instead of treating them as out of scope.
- Do not make "consistency" edits to working values or wording without
  verifying against a primary source.
