---
title: Data privacy
---

# Data privacy

prowl-review is **BYOK and runs in your CI runner or local environment** — your
runner talks straight to the LLM provider you chose, using the key you supplied.
There is no prowl-review service in the middle. This page states exactly where your
code and keys go, and the protections applied before anything leaves your runner.

## The short version

- **We never see your code.** prowl-review is a CLI/Action that runs in *your*
  environment; there is no prowl-review server, account, hosted endpoint, or proxy.
- **We never see or store your key.** It is read from your environment and used to
  call your provider directly — never proxied through us, never persisted.
- **Review prompt content goes to _your_ chosen provider.** The diff and any
  cross-file context are sent from your runner to that provider's public API, not
  through a prowl-review server.
- **No telemetry, no analytics, no phone-home.** The primary outbound calls are to
  your LLM provider and the GitHub API; optional configured features can also fetch
  your org-guidelines URL, Semgrep registry rules, or OSV.dev advisories.
- **Secrets are redacted and credential files skipped** before content is sent.

## Where your code goes

Inference requests go **directly from your runner to your provider's API** over
HTTPS — no intermediary, no prowl-review-hosted proxy:

| Provider | Endpoint your runner calls |
|---|---|
| Anthropic | `https://api.anthropic.com/v1/messages` |
| OpenAI | `https://api.openai.com/v1/chat/completions` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` |

Other outbound calls prowl-review can make: the **GitHub API** (fetch the diff,
post the review); an **org-guidelines URL** if you configure one; the **Semgrep
registry** if SAST grounding runs (metrics/version checks disabled, source stays on
the runner); and **OSV.dev** if dependency grounding runs. There are no analytics
or telemetry endpoints.

## What leaves the runner

Sent to your provider: the **size-guarded PR diff** and any **cross-file context**
the agentic retriever pulls — after these protections:

- **Secret redaction.** Detected secrets are replaced with `[REDACTED:<type>]` —
  private keys, AWS keys, GitHub tokens & PATs, LLM keys, Google API keys, Slack
  tokens, JWTs, and `key=value` credential assignments. The **count** is surfaced;
  the value is never logged.
- **Sensitive-file skipping.** Credential-looking files are never read into
  context: `.env*`, `*.pem`/`*.key`/keystores, SSH keys, `.npmrc`/`.netrc`, and
  `credentials`/`secrets` files.
- **No silent drops.** When a guardrail skips a file or caps content, it's reported
  in the review.

## Data retention

prowl-review retains **nothing** — no database, no logs of your code, no copy of
your key. State that persists (incremental-review markers, the repo-wide learnings
store) lives **in your own GitHub** as PR-comment markers and a tracking issue in
your repo, under your control. What your provider retains is governed by **your
account and your agreement with that provider** — configure zero-retention /
no-training on your provider account and it applies to prowl-review's requests
automatically.

## Why this beats hosted SaaS reviewers

Commercial reviewers proxy your code through their servers and resell inference —
which is why they must rate-limit and why your code transits a third party. With
prowl-review there is no extra inference vendor between you and your provider: no
prowl-review server sees your code, no usage caps originate from us, and per-review
cost is whatever your provider charges (cents), billed to you directly.

## See also

- [Authentication & keys](/auth) — how keys are supplied and why subscription routing isn't.
- [SECURITY.md](https://github.com/prowl-tools/prowl-code-review/blob/main/SECURITY.md) — vulnerability reporting + untrusted-PR handling.
