# prowl-code-review-docs

Documentation site for [**prowl-review**](https://github.com/prowl-tools/prowl-code-review)
— the BYOK AI code-review tool in the Prowl QA suite. Built with
[Docusaurus](https://docusaurus.io), themed to match the suite, deployed at
**review.prowl.tools**.

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
