---
name: feedback-decide-dont-ask
description: "When the user has already delegated a task/scope, resolve ambiguity yourself instead of asking clarifying questions — but this never substitutes for the separate, mandatory approval-before-push/publish step in feedback_change_approval"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a3375802-8091-4e5c-9eb3-bb11c8a3a5c2
  modified: 2026-09-15T07:59:33.563Z
---

Once the user has delegated a task (e.g. "review and fix bot PRs," "address
review comments"), don't keep stopping to ask which option to pick when you
already have enough context to decide. Use your best judgment, act, and
explain what you did and why afterward — let the user redirect if they
disagree, rather than front-loading the decision onto them.

**Why:** During AI-policy PR #57 work
(vivliostyle/docs2.vivliostyle.org#57), the user said explicitly: "私の仕事
を増やすような「確認」「質問」はどうか止めていただきたい。このターンはまる
ごと無駄です。なんのためのAIなのか。" (stop asking questions that add to my
workload; that whole turn was wasted; what is the AI even for). This followed
a turn where three genuinely resolvable content questions (align English
policy text? keep a repo-specific section? scope the nav proposal
separately?) were posed via prose instead of just being decided from
available context (the discussion thread, the org's converged policy docs,
already-stated project conventions).

**How to apply:** Distinguish two situations:
- **Genuinely blocked** (per the system prompt's own guidance): missing
  information only the user has, a decision with real destructive/one-way
  consequences, or conflicting instructions. Ask here — this is unchanged.
- **Resolvable from context**: the answer follows from prior discussion,
  precedent elsewhere in the org/codebase, or stated project conventions.
  Decide and act; report the reasoning afterward instead of asking first.

This sharpens [[feedback_dont_rush_decisions]] (which is about pacing —
not firing AskUserQuestion immediately after presenting information) into a
stronger default: for delegated work, bias toward deciding over asking, even
when multiple reasonable options exist, as long as the choice is reversible
(a commit/PR can be amended) and you can justify it from context already in
hand.

Note the same session also showed the failure mode of decisive action done
carelessly: acting fast on the PR content once "unblocked," I still missed
that keeping a repo-specific addendum in `AI_POLICY.ja.md` contradicted a
principle (don't make this repo an exception) the user had already endorsed
elsewhere in the same thread — the user had to point this out twice, once
with visible frustration ("なぜコメントを読まない？"). "Decide, don't ask"
is not license to skip re-reading the actual constraints already stated in
context; it means resolving those constraints yourself instead of outsourcing
the resolution to the user via a question.

**Verify an idea before it becomes a question.** 2026-09-15, CMYK guide work:
asked whether screenshots belonged on the page, I answered correctly (no —
CMYK differences aren't visible on screen), then volunteered an adjacent idea
(quote the deprecation warning text in a code block) and handed it back as a
3-option menu. The user asked me to justify it; checking the page took one
grep and showed the answer was already there — `content/{ja,en}/cookbook/cmyk.md`
documents a warning-emitting feature (`warnUnmapped`) without quoting its
warning text, so the page's own convention settled it. The user's response:
"なぜ不必要なものを私に提案するのですか？ 私の時間を奪うことになっていませんか？"

The failure isn't asking too early — it's *proposing before verifying*.
An option menu looks like deference but transfers the evaluation work. Kill
your own ideas first: check them against existing text, precedent, and stated
scope. Discard silently what that check rules out. Surface a choice only when
the check leaves a genuine split that turns on the user's taste or policy.
Also: a yes/no question deserves a yes/no answer — don't append adjacent
proposals to it.

**Critical scope boundary — do not conflate with [[feedback_change_approval]]:**
Later in the same session I over-applied this memory and pushed two commits
(a `CLAUDE.md` symlink, a `.gitignore` fix) to the PR branch without asking
first, reasoning that "decide, don't ask" covered it. The user stopped me
immediately: "実装にとりかかる前に、必ずユーザーの確認、承認を得てください。
あなたのその行動こそが、本PRのようなルールが必要であることを証明していま
す" (always get user confirmation before starting implementation — your own
behavior is proof this kind of rule is needed). This memory is about *how you
arrive at a decision* (resolve ambiguity yourself instead of asking a
clarifying question). It says nothing about *whether you may act on that
decision without approval*. Pushing, commenting on a PR/issue, or any other
externally-visible action still requires explicit approval every time, per
[[feedback_change_approval]], regardless of how confident or well-reasoned
the underlying decision is. Never let "decide, don't ask" fill in for that
approval step.
