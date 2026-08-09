---
title: GitHub Action
---

# GitHub Action

prowl-review runs as a composite GitHub Action. It posts one cohesive review
(walkthrough summary + inline findings), updates it in place on each push, and can
also run in command mode for `@prowl-review` chat.

## Auto-review workflow

The simplest setup — a standalone `pull_request`-triggered workflow:

```yaml
# .github/workflows/prowl-review.yml
name: prowl-review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
permissions:
  pull-requests: write   # post the review + inline comments
  issues: write          # summary comment + repo-wide learnings
  checks: write          # optional merge-gate check run
  contents: read
jobs:
  review:
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: prowl-tools/prowl-code-review@v1
        with:
          ai-key: ${{ secrets.PROWL_AI_KEY }}
          # min-severity: major
          # ai-provider: anthropic   # anthropic | openai | gemini
```

:::note One checks row or two?
A `pull_request`-triggered workflow always adds its own octocat Actions row to the
PR checks list. With the default `checkRun.enabled: false`, that Actions row is the
only prowl-review status. If you also enable the branded
[Prowl Review check run](#check-run) with `checkRun.enabled: true`, prowl-review
appears twice. For the hosted-reviewer look (the branded row **only**), use the
[single-row `workflow_run` setup](#single-row) below.
:::

## Single branded row (`workflow_run`) {#single-row}

Workflows triggered by `workflow_run` — "run when CI finishes" — attach **no row**
to the PR checks list. Chaining the auto-review off your CI workflow makes the
branded **Prowl Review** check run the only prowl-review presence on the PR:

```yaml
# .github/workflows/prowl-review.yml
name: prowl-review
on:
  workflow_run:
    workflows: [CI]        # the `name:` of your CI workflow
    types: [completed]
permissions:
  pull-requests: write
  issues: write
  checks: write
  contents: read
  actions: read            # read the completed CI run for PR resolution
jobs:
  review:
    if: ${{ github.event.workflow_run.event == 'pull_request' && github.event.workflow_run.conclusion == 'success' }}
    # Resolve the PR number, then pass it to prowl-review with `pr-number`.
```

Requirements and behavior:

- **Your CI workflow must subscribe to the PR transitions** that should trigger a
  review (`workflow_run` does not preserve the original action):
  `on: pull_request: types: [opened, synchronize, ready_for_review, reopened]`.
- The workflow is triggered after each completed CI run, but the review job runs
  only when CI **succeeds** and that CI run came from a `pull_request` event;
  failed, cancelled, or non-PR CI runs skip the review.
- The workflow resolves the PR from the `workflow_run` payload (requiring exactly
  one open PR at the CI head SHA) and hands it to the action via the `pr-number`
  input; fork and draft PRs are skipped safely.
- The [check run](#check-run) becomes the only prowl-review status on the PR —
  keep `checkRun.enabled: true` so reviews stay visible.

The full PR-resolution wiring lives in the maintained templates — copy
[`examples/reusable/`](https://github.com/prowl-tools/prowl-code-review/tree/main/examples/reusable)
(org-wide, recommended) rather than hand-rolling it. The standalone
`pull_request` variant above remains fully supported when the extra Actions row
doesn't bother you.

## Inputs

| Input | Purpose |
|---|---|
| `ai-key` | Generic provider key (single-provider). Pass a secret. |
| `ai-key-anthropic` / `ai-key-openai` / `ai-key-gemini` | Per-provider keys (for the [ensemble](/ensemble)). |
| `ai-provider` / `ai-model` | Provider / model override. |
| `min-severity` | Only surface findings at/above a severity. |
| `config-path` | Trusted `.prowl-review.yml` path (base-branch checkout). |
| `guidelines-path` | Trusted checkout for `REVIEW_GUIDELINES.md`/`CLAUDE.md`/`LEARNED_PATTERNS.md`. |
| `org-guidelines-path` | Org-wide guidelines file **or** `http(s)` URL. |
| `github-token` | Token used to post (defaults to `${{ github.token }}`). |
| `bot-login` | Expected bot login for a custom GitHub App token, e.g. `your-app[bot]`. |
| `mode` | `review` (default) or `command`. |
| `pr-number` | Explicit PR number to review — required for [`workflow_run`-triggered](#single-row) workflows (that event carries no PR context). Empty = resolve from the GitHub event. |

For a custom GitHub App identity, mint a short-lived installation token before
this Action runs, pass that token as `github-token`, and set `bot-login` to the
App bot login. See [Auth](/auth#bring-your-own-bot-identity) for the full
workflow.

See [Auth](/auth) for how keys are passed (masked secrets, env-only) and
[Privacy](/privacy) for what leaves the runner.

## Trusted config {#trusted-config}

The Action **ignores repo config unless you pass a trusted `config-path`** — check
out the base branch to a separate path and point `config-path` at it, so a PR
author can't change review policy from their branch. Config and guidelines always
load from the trusted base, never from PR code.

## Check run {#check-run}

With `checkRun.enabled: true` (and the `checks: write` permission), each review also
surfaces as a **Prowl Review** row in the PR checks list. The row is created
**in-progress** the moment review work starts and completes in place when the review
posts — so it shows a live running state and a duration, like any CI check. When you
post with a [custom GitHub App token](/auth#bring-your-own-bot-identity), the row
carries your App's avatar.

Conclusions:

- **Gated (`failOn: <severity>`)** — the check completes green (`success`) when no
  finding lands at or above that severity, and red (`failure`) when one does — a
  visual verdict with severity counts and per-line annotations. If review work
  cannot complete after the row has started, the check fails closed (`failure`)
  rather than completing neutral, so branch protection cannot be satisfied after
  a runtime error. It does not block merging unless you mark the check **Required**
  in branch protection (required check name: `Prowl Review`), which turns it into
  a real merge gate.
- **Informational (no `failOn`)** — the check completes grey (`neutral`), reporting
  severity counts without implying a pass/fail verdict. GitHub can treat neutral
  checks as successful for required-check purposes, so set `failOn` if you want a
  severity-based merge gate.
- **Neutral** is also used for reviews that deliberately didn't run (paused,
  on-demand-only, draft) or were superseded by a newer commit. Runtime errors on
  a started, non-superseded run close as `failure`. A started run is always closed
  out — it never dangles "in progress".

## Commands {#commands}

Add a second workflow for `@prowl-review` chat/commands:

```yaml
# .github/workflows/prowl-review-command.yml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
permissions:
  pull-requests: write
  issues: write
  checks: write
  contents: read
jobs:
  command:
    if: >
      contains(github.event.comment.body, '@prowl-review') &&
      (
        github.event_name == 'pull_request_review_comment' ||
        github.event.issue.pull_request
      )
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: prowl-tools/prowl-code-review@v1
        with:
          mode: command
          ai-key: ${{ secrets.PROWL_AI_KEY }}
```

See [Bot commands](/bot-commands) for the verbs.

## Reusable org workflow {#reusable-org-workflow}

To run prowl-review across a whole org without copy-pasting the full workflow,
define it once in your org's `.github` repo as a `workflow_call` (reusable)
workflow, then each repo opts in with a few lines:

```yaml
name: prowl-review
# Single-row setup (#single-row): chain off your CI workflow so the branded
# Prowl Review check run is the only prowl-review row on the PR. Your CI
# workflow must subscribe to the PR transitions that should trigger a review.
on:
  workflow_run:
    workflows: [CI]        # the `name:` of this repo's CI workflow
    types: [completed]
permissions:
  pull-requests: write
  issues: write
  checks: write
  contents: read
  actions: read            # PR-resolution fallback reads the completed CI run
jobs:
  review:
    if: ${{ github.event.workflow_run.event == 'pull_request' && github.event.workflow_run.conclusion == 'success' }}
    # Replace YOUR-ORG with the org or owner that hosts the reusable workflow.
    uses: YOUR-ORG/.github/.github/workflows/prowl-review.yml@v1
    secrets: inherit
    with:
      # workflow_run hides this workflow's Actions row, so keep the branded
      # replacement check visible unless another required status owns the gate.
      check-run: true
```

Templates live in the repo under `examples/reusable/`.

## Draft PRs & forks

Drafts are skipped by default (set `review.reviewDrafts: true`, or comment
`@prowl-review review` on demand). Fork PRs don't receive secrets, so a keyless
fork run is skipped safely; the recommended `if:` guard also restricts to same-repo
heads. See [Auth](/auth#fork-pull-requests).
