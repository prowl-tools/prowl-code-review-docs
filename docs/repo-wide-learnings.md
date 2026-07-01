---
title: Repo-wide learnings
---

# Repo-wide learnings

By default, muting a finding with [`@prowl-review ignore`](/bot-commands) or
`resolve` is scoped to that PR. **Repo-wide learnings** persists the mute so it
teaches **every** future PR — the OSS, BYOK equivalent of CodeRabbit "learnings",
with no external store.

## Enable it

```yaml
review:
  repoLearnings: true
```

When on, an `ignore` / `resolve` on any PR is recorded in a dedicated
**`prowl-review: learned patterns`** tracking issue in your repo, and every review
suppresses the matching finding across all PRs.

## How it works

- The store is a hidden, versioned marker in the issue body — **you control it
  directly**: delete a line to re-surface a finding, or **close the issue** to
  clear the whole store. Only open, bot-authored marked issues count.
- Muting is **trust-gated** (only owner/member/collaborator commands can teach it)
  and **best-effort** — a failed issue write never blocks the per-PR mute.
- No new permission is needed beyond the `issues: write` the review already uses;
  no repo commits, no external database.

## Guidelines & learned patterns

Separately, prowl-review injects repo guidelines (`REVIEW_GUIDELINES.md` or
`CLAUDE.md`) and a `LEARNED_PATTERNS.md` "do-not-raise" file from the trusted
checkout into every review. Set an org-wide standard with
`org-guidelines-path` — a **file path or an `http(s)` URL** — to share one standard
across repos. Fetched content is treated as untrusted prompt data.
