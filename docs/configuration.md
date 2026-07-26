---
title: Configuration
---

# Configuration

prowl-review is configured with a `.prowl-review.yml` file, validated against a
strict schema (unknown keys are rejected). **Secrets never live here** — provider
API keys always come from the environment (see [Auth](/auth)).

> **Trust note (GitHub Action).** The Action ignores repo config unless you pass a
> trusted `config-path` (a base-branch checkout), so a PR author can't alter review
> policy from their branch. See [GitHub Action](/github-action#trusted-config).

## Example

```yaml
review:
  minSeverity: minor        # drop findings below this severity
  minConfidence: 0.5        # drop low-confidence non-critical findings
  maxFindings: 25           # cap findings surfaced
  maxInlineComments: 20     # cap inline comments; overflow rolls into the summary
  verify: true              # skeptical false-positive verification pass
  incremental: true         # on re-run, review only the delta since last review
  resolveThreads: true      # tidy fixed/settled threads on re-run
  rejustifyDisputed: true   # on "I disagree", defend or withdraw the finding
  repoLearnings: false      # persist ignore/resolve mutes repo-wide (see the guide)
  auto: true                # auto-review PR events (false = on-demand only)
  reviewDrafts: false       # also auto-review draft PRs

context:
  enabled: true             # agentic cross-file context retrieval
  maxRounds: 6
  maxFiles: 20

grounding:
  enabled: true             # feed linter/SAST results into the review
  semgrep:
    enabled: true
    config: p/default

suggestions:
  minConfidence: 0.8        # min confidence to offer a committable suggestion block

checkRun:
  enabled: false            # publish a "Prowl Review" row in the PR checks list
  # failOn: major           # fail the check at/above this severity (omit = informational)

ensemble:
  enabled: false            # review with multiple providers at once
  providers:
    - provider: anthropic
    - provider: gemini

ignore:
  - "**/*.md"               # globs excluded from review (replaces built-in defaults)
```

## Key options

| Key | Default | Purpose |
|---|---|---|
| `review.minSeverity` | `minor` | Drop findings below this severity. |
| `review.minConfidence` | `0.5` | Drop low-confidence non-critical findings. |
| `review.maxFindings` | `25` | Cap findings surfaced. |
| `review.maxInlineComments` | `20` | Cap inline comments; overflow → summary. |
| `review.verify` | `true` | Skeptical false-positive verification pass. |
| `review.incremental` | `true` | Review only the delta on re-runs. |
| `review.resolveThreads` | `true` | Resolve fixed/settled threads on re-run. |
| `review.rejustifyDisputed` | `true` | Re-justify a disputed finding instead of silently dropping it. |
| `review.repoLearnings` | `false` | Persist `ignore`/`resolve` mutes across PRs — see [Repo-wide learnings](/repo-wide-learnings). |
| `review.auto` | `true` | Auto-review PR events (`false` = on-demand only). |
| `review.reviewDrafts` | `false` | Also auto-review draft PRs. |
| `context.enabled` / `maxRounds` / `maxFiles` | `true` / `6` / `20` | [Cross-file context](/cross-file-context) bounds. |
| `grounding.enabled` / `semgrep` | `true` | [Linter/SAST grounding](/grounding). |
| `suggestions.minConfidence` | `0.8` | Min confidence to offer a committable suggestion. |
| `checkRun.enabled` | `false` | Publish a **Prowl Review** check run — see [Check run](/github-action#check-run). |
| `checkRun.failOn` | *(unset)* | Severity at/above which the check fails; below it, green. Unset = informational, grey `neutral`. |
| `ensemble.enabled` / `providers` | `false` | [Multi-provider ensemble](/ensemble). |
| `ignore` | built-ins | Globs excluded from review. |

Per-PR overrides can also be set at runtime with
[`@prowl-review configure`](/bot-commands) — they win over the config file for that
PR only.
