# Generative AI Policy

This document is a draft for review — not yet adopted.

This policy applies to this repository
([docs2.vivliostyle.org](https://github.com/vivliostyle/docs2.vivliostyle.org)),
part of the [Vivliostyle organization](https://github.com/vivliostyle).
"Improving and enhancing documentation" is explicitly named as one of the
funded work items in Vivliostyle's
[NLnet NGI0 Commons Fund grant](https://nlnet.nl/project/Vivliostyle/), so
this project adheres to NLnet's
[policy on the use of generative AI](https://nlnet.nl/foundation/policies/generativeAI/).
This document is the public disclosure of our stance on generative AI use
that the policy asks funded projects to provide.

This repository is a documentation site, not a software library. Compared to
sibling projects such as
[Vivliostyle CLI](https://github.com/vivliostyle/vivliostyle-cli), the risks
of AI assistance here center less on runtime correctness and more on
technical accuracy of prose, faithfulness to source material, and writing
quality in two languages. The sections below on content quality and source
fidelity reflect that difference; the disclosure mechanics follow the same
convention as other Vivliostyle projects so that tooling and expectations
stay consistent across the organization.

## Our stance

We use generative AI tools in the development of this site, and we disclose
that use openly. AI is a tool that assists human writers and developers. It
does not replace human judgment or responsibility. A human maintainer
designs, reviews, and verifies every change before it is merged. The human
committer is fully responsible for the correctness, quality, and licensing
of all submitted work, whether or not AI tools were used.

## Tools we use

- Claude Code (Anthropic): drafting and revising documentation content in
  Japanese and English, translation, build/tooling code (Astro, content
  pipelines, scripts), debugging, and code samples embedded in docs. The
  specific model is recorded per commit (see below).
- GitHub Copilot: automated pull request review.

The set of tools may change over time. The disclosure rules below apply to
whichever generative AI tool is used.

## Per-commit disclosure

Commits that contain AI-generated content carry a trailer naming the tool
and the specific model used, following the
[format adopted by the Linux kernel](https://www.kernel.org/doc/html/latest/process/coding-assistants.html):

```
Assisted-by: Claude Code:claude-sonnet-5
```

We prefer this over `Co-authored-by:` because authorship, with the rights
and responsibilities that come with it, stays with the human committer. The
AI is a tool that assists. Trailers added automatically by tools, such as
`Co-authored-by: Copilot <copilot@github.com>` on PR review commits, are also
accepted as disclosure. Contributors do not need to reconfigure their tools.

We do not put full prompt transcripts in commit messages. Instead, we
describe the collaboration in the pull request: what was delegated to the
AI, and what the human contributor designed, decided, reviewed, and
verified. The pull request body also carries the `Assisted-by:` line, wrapped
in a `<details>` block so the body stays readable:

```markdown
Fix broken links in the tutorials FAQ section.

Assisted-by: Claude Code:claude-sonnet-5

<details>
<summary>How the AI was used</summary>

- The human author identified the broken links from an issue report and
  decided which target pages each should point to.
- The AI located the affected files and applied the link corrections.
- The human author verified each corrected link resolves to the intended
  page before requesting review.

</details>
```

We disclose the fact and method of AI use — tool, model, and a
human-written summary of the division of labor — when each commit and
pull request is created. We do not publish verbatim conversation logs or
links to private AI sessions anywhere in the repository, its commits, or
its pull requests. NLnet's policy explicitly permits a summary in place
of raw prompts and interactions ("the used prompts/interactions and
resulting output, or a summary thereof"), and the policy's origin at
[vivliostyle.pub](https://github.com/vivliostyle/vivliostyle.pub/pull/77)
relies on the same summary-only approach. We choose it because a working
session often spans context beyond the change at hand, and because a
link to a private session is not genuine public disclosure if outside
readers cannot open it.

## Content quality and source fidelity

This is the section where a documentation site's risks differ most from a
code repository's. AI-assisted content must meet the same bar we already
hold ourselves to:

- **Verify before writing.** Technical claims — CLI flags, config options,
  API behavior, build output — must be confirmed against the actual running
  code or the upstream source (`submodules/vivliostyle-cli`,
  `submodules/vfm`, `submodules/themes`, `submodules/vivliostyle.js`,
  `submodules/awesome-vivliostyle`), not written from the AI's assumption of
  how something "should" work.
- **Preserve technical accuracy across languages.** When AI assists with
  translation or bilingual rewrites, the result must match the technical
  content of the source, not merely read fluently. Do not let the AI
  introduce behavior, defaults, or claims that the source doesn't support.
- **Write natural Japanese and English prose.** Avoid AI-typical phrasing —
  literal-translation idioms, formulaic constructions, hedging filler that
  adds no information. Prefer established natural terminology (including
  Japanese equivalents for common English technical terms) over stiff
  transliteration, except where the English term is the ecosystem standard.
- **No unverified "consistency" edits.** Don't change a working value,
  number, or piece of wording solely to make it "match" something else
  without checking the primary source. Don't present an incidental change as
  part of the requested fix.
- **Navigation and discoverability are part of the change.** When AI-assisted
  work adds a new page or section, its entry points (global nav, top page,
  breadcrumbs) must be explicitly proposed for review, not silently treated
  as out of scope.
- **Polished output is not a substitute for understanding.** The committer
  must be able to explain and defend every change in review, in either
  language.

## Copyright and licensing

- Do not submit AI output that reproduces third-party copyrighted material.
  Take particular care with content drawn from external books, blog posts,
  or documentation not published under a compatible license.
- When AI assists with content sourced from upstream Vivliostyle
  repositories (via the submodules above), it must reflect what those
  sources actually say — it does not gain license or standing to originate
  new technical claims on their behalf.
- Purely AI-generated work with no meaningful human involvement is not
  accepted.
- All contributions must be publishable under a recognized free/open-source
  license.

## Contributions from others

We welcome contributions, with or without AI assistance:

- If you made substantive use of generative AI, say so in your pull request
  description: which tool and model, and what you used it for. Add the
  trailer described above to AI-assisted commits.
- Write pull request descriptions and issue reports yourself. Clearly mark
  any text written by an LLM.
- You must understand the content you submit — technical claims and prose
  alike — and be able to discuss it in review.

## Review of this policy

We review this policy whenever NLnet updates its generative AI policy, when
Vivliostyle's organization-wide stance changes, and as the generative AI
landscape changes. Questions are welcome on this repository's issue tracker.
