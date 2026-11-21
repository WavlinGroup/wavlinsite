# Wavlin website

Source code for the [Wavlin](https://github.com/WavlinGroup/Wavlin) website, adapted from the Metrolist website (MetrolistGroup/metrosite) by Nyx and contributors.

## Tech

- Vue 3, Vue Router, Vite
- Static prerendering (Vue SSR) deployed with Cloudflare Workers assets (`wrangler.toml`)

## Commands

- `bun install`
- `bun run dev` – local dev server
- `bun test` – unit tests
- `bun run build` – type-check, build, prerender every route, write sitemap, `llms.txt`, Markdown twins, and Cloudflare `_headers` / `_redirects`
- `bun run check` – tests, navigation self-check, and build

## Shared links

- `/shared?name=…&ids=a,b,c` and `/playlist?ids=…&name=…` open the Wavlin shared-playlist page, which launches `wavlin://shared?…` (on Android through an intent URL with a GitHub Releases fallback).
- `/playlist?list=…`, `/watch?v=…`, `/browse/:id`, `/channel/:id`, `/album/:id`, `/artist/:id`, and trusted `/open?url=…` targets open a shared-music page with Wavlin and YouTube Music links.
- Short `/p/<code>` links are served by the Cloudflare Worker in the Wavlin repo (`worker/share-worker.js`), not by this site.

## Notes

- The privacy policy is a draft and has not been reviewed.
- Release asset names in `src/content/downloads.ts` still need confirming against a real Wavlin release.
- Browser checks need an external Playwright: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs bun run test:browser`.
