---
name: ai-policy-check
description: Check compliance with AI_POLICY.md when creating a git commit or a pull request in this repository.
---

# AI Policy compliance check

For commits and pull requests that contain AI-generated changes (see
`AI_POLICY.md` / `AI_POLICY_ja.md` at the repository root):

<!--
  The "does not need to be last" / Co-authored-by clauses below were added
  after a Copilot review on PR #57 found this checklist stricter than
  AI_POLICY.md itself, which explicitly accepts tool-added Co-authored-by:
  trailers as disclosure. Keep this checklist in sync with the policy text
  rather than re-tightening it independently.
-->
- **Commit**: the message includes an `Assisted-by: AGENT_NAME:MODEL_VERSION`
  trailer, naming the exact model used, e.g.
  `Assisted-by: Claude Code:claude-sonnet-5`. It does not need to be the last
  trailer. Tool-added `Co-authored-by:` trailers (e.g. from GitHub Copilot on
  PR review commits) are also accepted as disclosure, per AI_POLICY.md.
- **PR body**: contains the same `Assisted-by:` line, and a short description
  of the human/AI division of labor inside a
  `<details><summary>How the AI was used</summary>` block (see the example in
  `AI_POLICY.md`).
- **Content**: technical claims are verified against the actual source
  (running code or `submodules/`), not written from assumption. No
  third-party copyrighted material is reproduced.

Fix anything that does not match before pushing or opening the PR.
