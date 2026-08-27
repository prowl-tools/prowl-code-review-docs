# prowl-code-review-docs

> **Archived (2026-08-26).** This documentation site is retired and `review.prowl.tools` no
> longer serves it. `prowl-review` is now maintained as its author's internal code-review tool,
> and its documentation lives next to the code in
> [`prowl-tools/prowl-code-review/docs/`](https://github.com/prowl-tools/prowl-code-review/tree/main/docs).
> This repository is kept read-only for reference.

Documentation site for [**prowl-review**](https://github.com/prowl-tools/prowl-code-review)
— the BYOK AI code-review tool. Built with
[Docusaurus](https://docusaurus.io), themed to match the suite, formerly deployed at
`review.prowl.tools`.

## Develop

```bash
npm install
npm start        # local dev server at http://localhost:3000
```

## Build

```bash
npm run build    # static site → build/
npm run serve    # preview the production build
```

## Structure

- `docs/` — the content (getting-started, reference, guides, policy, example).
- `sidebars.ts` — sidebar structure.
- `docusaurus.config.ts` — site config (title, nav, footer, `review.prowl.tools`).
- `src/css/custom.css` — suite theme (cyan→green palette, Space Grotesk).
- `static/img/` — logo, mascot, favicons (shared with the suite).

## Deploy

Static output in `build/` — deploy to Vercel (recommended) or any static host, with
DNS pointing `review.prowl.tools` at it.
