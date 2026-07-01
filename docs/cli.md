---
title: CLI
---

# CLI

prowl-review ships as a CLI (the same core the GitHub Action wraps). Install it
globally or run it with `npx`:

```bash
npm install -g prowl-review
# or
npx prowl-review <command>
```

All commands read the provider key from the environment (`PROWL_AI_KEY` or
`PROWL_AI_KEY_<PROVIDER>`) — see [Auth](/auth).

## `prowl-review review`

Review a pull request (the Action entry point) or a local diff.

```bash
# Review a GitHub PR (token + repo + PR from flags or the Actions event)
PROWL_AI_KEY=sk-… prowl-review review --repo owner/name --pr 128

# Local pre-push review against a base ref (no GitHub needed)
PROWL_AI_KEY=sk-… prowl-review review --base main
```

Common flags:

| Flag | Effect |
|---|---|
| `--base <ref>` | Local review against a git ref. |
| `--min-severity <level>` | Only surface findings at/above a severity. |
| `--no-context` / `--no-grounding` / `--no-verify` | Skip cross-file context, grounding, or the false-positive pass. |
| `--no-incremental` | Force a full-PR review. |
| `--dry-run` | Build the review but don't publish. |
| `--debug [path]` | Write a structured JSONL run trace (prompts, context, findings, cost). |

## `prowl-review command`

Handle an `@prowl-review` comment (the command-mode Action entry). Reads the
`issue_comment` / `pull_request_review_comment` event. See [Bot commands](/bot-commands).

## `prowl-review eval`

Score the reviewer against an in-repo benchmark of PRs with known bugs (and clean
PRs that should stay quiet) — precision / recall / F1, with CI gates. Useful for
proving prompt/model/threshold changes don't regress.

```bash
PROWL_AI_KEY=sk-… prowl-review eval --min-precision 0.8 --min-recall 0.7
```
