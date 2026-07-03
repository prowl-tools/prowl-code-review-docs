---
title: Linter / SAST grounding
---

# Linter / SAST grounding

Deterministic tools run over the changed files and their results are fed into the
review as **grounding** — so the specialists reconcile with real linter/SAST output
instead of re-discovering (or hallucinating) issues. This lifts precision and
catches mechanical problems the LLM might gloss over.

Runners (each skips gracefully when the tool isn't installed):

| Runner | Catches | Languages |
|---|---|---|
| **ESLint** | Lint errors/warnings | JS/TS |
| **Ruff** | Lint issues | Python |
| **Gitleaks** | Committed secrets | any |
| **Semgrep** | SAST / security patterns | multi-language |
| **osv-scanner** | Dependency CVEs / license issues | manifests/lockfiles |

Findings are normalized (category `lint`/`security`, calibrated severity +
confidence), merged into the review, and de-duplicated by the judge against
anything the LLM independently found.

## Trust model

Repo-local linters can execute project-defined config/plugins, so prowl-review only
runs them when the workspace is **trusted** — enabled via `--trust-workspace` (CLI)
or the `trust-workspace` Action input, and **disabled automatically for fork PRs**.
Untrusted checkouts skip repo-local execution and say so in the review notes.

## Configure

```yaml
grounding:
  enabled: true        # master switch
  semgrep:
    enabled: true
    config: p/default  # a Semgrep registry pack (p/…, r/…, auto)
```

Turn everything off with `--no-grounding`. Only Semgrep **registry** refs are
fetched; repo-path/remote-URL rulesets are skipped. See [Privacy](/privacy) for
the exact outbound calls grounding can make.
