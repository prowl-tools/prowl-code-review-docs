---
title: Bot commands
---

# Bot commands

Drive prowl-review from pull-request comments with `@prowl-review <command>`. Only
mentions from a repo **owner / member / collaborator** are honored (the tool
re-checks author trust independently of any workflow guard).

| Command | Effect |
|---|---|
| `@prowl-review review` | Re-review the latest changes (incremental). |
| `@prowl-review full review` | Re-scan the entire PR from scratch. |
| `@prowl-review ignore` | Reply on a finding to mute it — it won't be raised again on this PR (and repo-wide when [`review.repoLearnings`](/repo-wide-learnings) is on). |
| `@prowl-review resolve` | Reply on a finding to mark its thread resolved and stop re-raising it (closes the thread, unlike `ignore`). |
| `@prowl-review configure <key=value …>` | Set per-PR `review.*` overrides listed in [Configuration](/configuration), such as `minSeverity`, `maxFindings`, `verify`, `incremental`, and `reviewDrafts`; `configure reset` clears them. |
| `@prowl-review pause` / `resume` | Stop / re-enable auto-review on new pushes for this PR. |
| `@prowl-review docstrings` | Draft docstrings for the changed code, posted as a copy-paste reply. |
| `@prowl-review tests` | Draft unit-test stubs for the changed code. |
| `@prowl-review help` | List the available commands. |
| `@prowl-review <question>` | Ask a free-form question — answered in-thread, grounded in the PR diff. |

## Replying to findings

Reply on a finding's thread and prowl-review honors it on the next review:
"won't fix" / "acknowledged" resolves the thread and stops re-raising it. Reply
**"I disagree"** (or "false positive", "not a bug") and the judge actively
**re-evaluates** — it either defends the finding with reasoning (thread stays
open, still gates merge) or withdraws it (concedes and resolves). Turn this off
with `review.rejustifyDisputed: false`.

## Per-PR settings

`@prowl-review configure minSeverity=major maxFindings=10 verify=false` sets
review settings for the current PR only; they persist in the summary's state
marker and win over the repo config. Supported keys match the `review.*` options
listed in [Configuration](/configuration): `minSeverity`, `minConfidence`,
`maxFindings`, `maxInlineComments`, `verify`, `incremental`, `resolveThreads`,
`rejustifyDisputed`, `repoLearnings`, `auto`, and `reviewDrafts`. Invalid input
replies with usage instead of silently weakening the review. Use
`@prowl-review configure reset` to clear them.

Wiring the command workflow requires both `issue_comment` for PR conversation
comments and `pull_request_review_comment` for inline finding-thread replies —
see [GitHub Action](/github-action#commands).
