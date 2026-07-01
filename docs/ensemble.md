---
title: Multi-provider ensemble
---

# Multi-provider ensemble

Review with more than one model at once (e.g. Claude + Gemini) and merge the
results. Each provider runs the full multi-pass review **in parallel**; a judge
consolidates and de-duplicates the findings into one clean result, marking
findings that **≥2 providers independently raised** with a 🤝 consensus badge.

## Enable it

Set per-provider keys and turn on the ensemble in config:

```yaml
# .prowl-review.yml
ensemble:
  enabled: true
  providers:
    - provider: anthropic
    - provider: gemini
```

```yaml
# workflow
- uses: prowl-tools/prowl-code-review@v1
  with:
    ai-key-anthropic: ${{ secrets.PROWL_AI_KEY_ANTHROPIC }}
    ai-key-gemini: ${{ secrets.PROWL_AI_KEY_GEMINI }}
```

The first configured provider is the **primary** — it runs the shared cross-file
context retrieval, which the other providers reuse. If fewer than two providers
have keys, prowl-review falls back to a normal single-provider review (and says so
in the review notes).

The published review shows a per-model breakdown so you can see which provider
raised what, with the consensus findings highlighted.
