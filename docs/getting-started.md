---
slug: /
title: Getting started
sidebar_position: 1
---

<div className="docs-hero">
  <div>
    <p className="docs-hero__eyebrow">Prowl Suite · Code Review</p>
    <h1>prowl-review</h1>
    <p className="docs-hero__subtitle">
      BYOK AI code review for pull requests — multi-pass specialists, agentic
      cross-file context, linter/SAST grounding, and false-positive verification.
      Your key, your provider, <strong>no rate limits</strong>.
    </p>
    <div className="docs-hero__actions">
      <a className="button button--primary button--lg" href="#quickstart">Add to a repo →</a>
      <a className="button button--secondary button--lg" href="https://github.com/prowl-tools/prowl-code-review">GitHub</a>
    </div>
  </div>
  <div className="docs-hero__art">
    <img src="/img/prowl-mascot.png" alt="Prowl raccoon mascot" />
  </div>
</div>

**prowl-review** is the code-review pillar of the [Prowl QA suite](https://prowl.tools).
It reviews pull requests — a walkthrough summary, inline findings with committable
suggestions, and an `@prowl-review` chat/command bot — using **your own** LLM key.
Because you pay the provider directly, there are no usage caps imposed by us.

- **Bring your own key (BYOK).** Claude (default), OpenAI, or Gemini. See [Auth](/auth).
- **Quality-first, not diff-only.** Multi-pass review + judge/dedup, cross-file
  context, grounding, and a skeptical verification pass — see the guides.
- **Zero hosting.** Ships as a GitHub Action + a local CLI. Your code only ever
  goes to your chosen provider — see [Privacy](/privacy).

## Quickstart {#quickstart}

1. Add your provider key as a repo secret named **`PROWL_AI_KEY`**
   (Settings → Secrets and variables → Actions).
2. Add the workflow:

```yaml
# .github/workflows/prowl-review.yml
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
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: prowl-tools/prowl-code-review@v1
        with:
          ai-key: ${{ secrets.PROWL_AI_KEY }}
```

3. Open a pull request — prowl-review posts a walkthrough summary and inline
   findings, and updates them in place on each push.

Rolling out across a whole org? Use the reusable
[`workflow_call` templates](/github-action#reusable-org-workflow) so each repo
opts in with a few lines.

## Local pre-push review

The same engine runs locally against a diff before you push:

```bash
npm install -g prowl-review          # or: npx prowl-review …
PROWL_AI_KEY=sk-… prowl-review review --base main
```

## Next steps

<div className="card-grid">
  <a className="card" href="/github-action">
    <h3>GitHub Action →</h3>
    <p>Inputs, permissions, drafts, forks, and the reusable org workflow.</p>
  </a>
  <a className="card" href="/configuration">
    <h3>Configuration →</h3>
    <p>Tune severity, findings, verification, and more in <code>.prowl-review.yml</code>.</p>
  </a>
  <a className="card" href="/bot-commands">
    <h3>Bot commands →</h3>
    <p><code>@prowl-review review</code>, <code>ignore</code>, <code>resolve</code>, <code>configure</code>, and chat.</p>
  </a>
  <a className="card" href="/ensemble">
    <h3>Multi-provider ensemble →</h3>
    <p>Review with Claude + Gemini at once and merge the findings.</p>
  </a>
</div>
