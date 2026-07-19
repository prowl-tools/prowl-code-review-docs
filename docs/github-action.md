---
title: GitHub Action
---

# GitHub Action

prowl-review runs as a composite GitHub Action. It posts one cohesive review
(walkthrough summary + inline findings), updates it in place on each push, and can
also run in command mode for `@prowl-review` chat.

## Auto-review workflow

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
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
permissions:
  pull-requests: write
  issues: write
  checks: write
  contents: read
jobs:
  review:
    # Replace YOUR-ORG with the org or owner that hosts the reusable workflow.
    uses: YOUR-ORG/.github/.github/workflows/prowl-review.yml@v1
    secrets: inherit
```

Templates live in the repo under `examples/reusable/`.

## Draft PRs & forks

Drafts are skipped by default (set `review.reviewDrafts: true`, or comment
`@prowl-review review` on demand). Fork PRs don't receive secrets, so a keyless
fork run is skipped safely; the recommended `if:` guard also restricts to same-repo
heads. See [Auth](/auth#fork-pull-requests).
