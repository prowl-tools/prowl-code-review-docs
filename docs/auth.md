---
title: Authentication & keys
---

# Authentication & key policy

`prowl-review` is **BYOK — bring your own key**. You supply your own LLM provider
API key; prowl-review uses it to talk to that provider directly and never resells
inference, meters usage, or imposes its own rate limits. This page is the
authoritative statement of how prowl-review authenticates — to your LLM provider
and to GitHub — and which auth methods are supported vs. deliberately not.

## TL;DR

- **Provider keys come from the environment only** — never from `.prowl-review.yml`,
  never committed to the repo.
- **Bring an API key for every provider** (Claude, OpenAI, Gemini). That is the
  only supported auth method today.
- **We never store or proxy your key.** It goes from your runner straight to your
  chosen provider (see [Privacy](/privacy)).
- **Subscription / OAuth routing is _not_ supported** for Claude or Gemini — doing
  so violates their consumer terms and gets accounts banned. OpenAI/Codex is the
  only provider where a subscription backend could ever be offered, and only as a
  documented, off-by-default, legally-reviewed opt-in (not yet built).

## Provider keys (BYOK)

prowl-review resolves the provider and key from environment variables, in this
order:

| Variable | Purpose |
|---|---|
| `PROWL_AI_PROVIDER` | Which provider to use: `anthropic` (default), `openai`, or `gemini`. |
| `PROWL_AI_KEY_<PROVIDER>` | Provider-scoped key, e.g. `PROWL_AI_KEY_ANTHROPIC`. **Preferred** — wins when set. |
| `PROWL_AI_KEY` | Generic fallback key, used when no provider-scoped key is set. |
| `PROWL_AI_MODEL` | Optional model override (otherwise the provider's default model). |

Resolution: the provider-scoped key `PROWL_AI_KEY_<PROVIDER>` is used if present,
otherwise `PROWL_AI_KEY`; if neither is set the run fails fast with a message
naming both variables. The multi-provider [ensemble](/ensemble) reads each
`PROWL_AI_KEY_<PROVIDER>` so several providers can review at once.

### Keys never live in the repo

The `.prowl-review.yml` schema **only** carries non-secret *selection* (which
provider, which model). Keys are read from the environment, full stop — there is
no config field that accepts a key, by design. Keep keys in your CI secret store
(GitHub Actions secrets) or your shell environment for local runs.

## GitHub Action

In the Action, pass your key(s) as **secrets** through the `ai-key*` inputs:

```yaml
- uses: prowl-tools/prowl-code-review@v1
  with:
    ai-key: ${{ secrets.PROWL_AI_KEY }}            # generic, single-provider
    # or per-provider (ensemble):
    # ai-key-anthropic: ${{ secrets.PROWL_AI_KEY_ANTHROPIC }}
    # ai-key-gemini: ${{ secrets.PROWL_AI_KEY_GEMINI }}
```

- Each `ai-key*` input is documented "Pass a secret" and is **exported to an env
  var only when non-empty** — a blank input never clobbers a key already in the
  runner environment.
- Keys are passed as environment variables to the CLI; they are **not written to
  disk** and GitHub's built-in secret masking redacts them from Action logs.

### Posting to GitHub

prowl-review posts with the standard **`GITHUB_TOKEN`** (the `github-token` input,
defaulting to `${{ github.token }}`). It needs `pull-requests: write` and
`issues: write` (and `checks: write` for the optional merge gate) — the
auto-provisioned Actions token, no PAT or GitHub App required. To post under a
custom GitHub-App identity, supply that app's token as `github-token` and set
`bot-login`.

### Bring your own bot identity

The bot branding is **not baked into the tool** — nothing "Prowl" or raccoon ships
inside the package. The Action posts as whatever identity you hand it via
`github-token` / `bot-login`, so every team can make prowl-review look like their
own in-house reviewer. It pairs naturally with BYOK: **your key, your bot.**

| Tier | Posts as | Setup |
| --- | --- | --- |
| **Default** | `github-actions[bot]` | Nothing — works out of the box with just your AI key. |
| **Your own brand** | `your-app[bot]` + **your** name & avatar | Register **your own** GitHub App (any name/avatar), add your `PROWL_APP_ID` / `PROWL_APP_PRIVATE_KEY` secrets. Identity is entirely yours. |
| **Local CLI** | *(no bot — prints to your terminal)* | Run `prowl-review` locally; no GitHub identity involved. |

There's no lock-in to the Prowl raccoon: a team can register `acme-review[bot]`
with their own logo and nobody would know it's built on prowl-review unless they
read the workflow. An App's power lives in its private key (kept in your secrets,
never shared), so each adopter registers their own — see the
[Branded bot identity](https://github.com/prowl-tools/prowl-code-review#branded-bot-identity-59)
setup in the README.

#### Reusing one App across repos and accounts

A GitHub App is a **server-side identity, not a per-device install** — reuse it by
installing it on more repos, never by copying anything to another machine. Where it
can go depends on the App's **"Where can this GitHub App be installed?"** setting:

- **More repos under the *same* owner** (the account/org that owns the App):
  **Install App** on those repos, or set `PROWL_APP_ID` / `PROWL_APP_PRIVATE_KEY`
  as **org-level secrets** so every repo inherits them. One App → unlimited repos.
- **Repos under a *different* owner** (e.g. your personal account when the App is
  org-owned): the App must be set to **"Any account"** (public) to install it there
  — flip it via **Make public** at the bottom of the App's settings. The private
  key stays secret, so going public only exposes the App's profile and lets others
  *install* it (inert without the key). The alternative is a **separate App** under
  that owner; App names are globally unique, so its bot login won't be identical
  (e.g. `prowl-review-personal[bot]`).

Running the **CLI** on another machine is unrelated: install `prowl-review` there
and set your AI key — the branded identity is a CI concept and doesn't live on the
device.

### Fork pull requests

GitHub does not expose repository secrets to fork-triggered workflows, so a fork
PR has no provider key. prowl-review handles this safely — a keyless run is skipped
rather than failing — and the recommended workflows additionally guard on
`head.repo.full_name == github.repository`.

## Why API keys only — the subscription question

"Can I reuse my Claude Pro / ChatGPT / Gemini *subscription* instead of buying API
credits?" The answer is policy, not laziness:

- **Claude (Anthropic) — not supported.** The
  [Anthropic Consumer Terms](https://www.anthropic.com/legal/consumer-terms) allow
  automated access only through an Anthropic API key or explicit permission;
  reusing subscription OAuth in a third-party tool is the non-API path and an
  account-ban risk. Use an Anthropic **API** key.
- **Gemini (Google) — not supported.** Google began enforcing against
  subscription-OAuth reuse in third-party tools (Feb 2026). Use a Gemini **API** key.
- **OpenAI/Codex — the only possible exception, and not yet built.** A Codex
  subscription backend is tracked as an explicitly opt-in, off-by-default,
  legally-reviewed feature — **blocked until documented Legal/Compliance sign-off**,
  reliant on subscription auth that is tolerated-but-not-sanctioned, liable to
  break or trigger enforcement, and not recommended for automated org-wide CI. It
  would be isolated behind the provider abstraction, never the default, with no
  equivalent for Claude/Gemini.

BYOK with real API keys is the supported, durable path — and because you pay the
provider directly, there are no prowl-review-imposed usage caps.

## Local CLI

The same key resolution applies to local review — export the env var and run:

```bash
PROWL_AI_KEY=sk-… prowl-review review --base main
```

## See also

- [Privacy](/privacy) — where your code and keys go (and don't).
- [SECURITY.md](https://github.com/prowl-tools/prowl-code-review/blob/main/SECURITY.md) — vulnerability reporting + the trust model.
