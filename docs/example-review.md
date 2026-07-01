---
title: Example review
---

# What a review looks like

A rendered sample of what prowl-review posts on a pull request. The **summary** is
one cohesive comment (updated in place on each push); **major+** findings also post
as inline comments with a committable suggestion and an "AI agent" prompt, while
minor nitpicks stay in the summary's collapsed section.

---

> **Impact:** 🟢 Low · **Estimated effort:** ▰▰▰▱▱ (3/5) · **Findings:** 🔴 1 🟠 1 🟡 1

### Walkthrough

Refreshes the OAuth access token before expiry, but the new path drops an error a
caller still depends on and can race two concurrent refreshes.

### Findings

| Severity | Location | Finding |
|---|---|---|
| 🔴 Critical | `src/auth/refresh.ts:42` | Refresh failure swallowed — caller sees a stale token, not an error |
| 🟠 Major | `src/auth/client.ts:88` | Race: two requests can refresh concurrently and clobber each other |

<details>
<summary>🤝 Per-model findings (Claude + Gemini)</summary>

- 🤝 **Critical** `src/auth/refresh.ts:42` — raised by both providers (consensus)
- 🟠 **Major** `src/auth/client.ts:88` — raised by Claude

</details>

<details>
<summary>🧹 Nitpicks (1)</summary>

- 🟡 **Magic number `3600`** — `src/auth/refresh.ts:17` — extract an `EXPIRY_SKEW_SECONDS` constant.

</details>

---

### Inline comment (posted on `src/auth/refresh.ts:42`)

> 🔴 **[critical] Refresh failure swallowed — caller sees a stale token, not an error**
>
> `refresh()` returns the old token when the network call fails, so callers can't
> tell a refresh failed and will send an expired token.
>
> ````suggestion
> if (!res.ok) throw new TokenRefreshError(res.status);
> ````
>
> <sub>🤖 Resolve with an AI agent: "In `src/auth/refresh.ts`, make `refresh()`
> throw `TokenRefreshError` on a non-OK response instead of returning the stale
> token; update callers to handle it."</sub>

---

> **Review notes**
> - Ensemble review: consolidated findings from 2 providers (anthropic, gemini). 🤝 marks findings ≥2 providers raised.
> - Dropped 3 finding(s) as likely false positives on verification.
> - Hid 1 finding(s) below the severity floor.

To try it on your own repo, see [Getting started](/).
