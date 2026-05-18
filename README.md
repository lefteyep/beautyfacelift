# Beauty Face Lift Zürich

Astro static site served by a Cloudflare Worker with Static Assets and API routes.

Canonical production origin:

```text
https://beautyfacelift-zuerich.ch
```

The temporary `beautyfacelift.mediapaulo.workers.dev` host must not be used as a public canonical URL. The old `beautyfacelift.ch` domain is separate and must not be configured, redirected, or treated as a migration source for this launch.

## Stack

- npm
- Astro static build
- Cloudflare Workers Static Assets
- Worker entrypoint: `worker/index.ts`
- API router: `itty-router`
- Cloudflare config: `wrangler.jsonc`
- Shared URL constants: `shared/site.ts`

## Commands

```bash
npm install
npm run dev
npm run build
npm run cf:dev
npm run qa:worker
npm run launch:check
npx wrangler deploy --dry-run
```

`npm run cf:deploy` builds and deploys to Cloudflare with `wrangler deploy --keep-vars`. Do not run a production deploy unless the current branch and release process are approved.

## Domain Launch

Production Workers custom domains are configured in `wrangler.jsonc`:

- `beautyfacelift-zuerich.ch`
- `www.beautyfacelift-zuerich.ch`

`www.beautyfacelift-zuerich.ch` redirects to `https://beautyfacelift-zuerich.ch` in the Worker before API or asset handling. `workers_dev` is disabled for production; if the temporary workers.dev host still reaches the Worker, it also redirects to the canonical apex.

The custom-domain launch was completed on 2026-05-07. The deployed Worker version recorded for that launch is `f376e963-48cf-4708-9130-650ed6e48b4b`.

The full DNS, all-inkl, Cloudflare, Search Console, and verification record lives in `docs/domain-launch-beautyfacelift-zuerich.md`.

## SEO Outputs

- Canonicals and Open Graph URLs use `https://beautyfacelift-zuerich.ch`.
- `robots.txt` points to `https://beautyfacelift-zuerich.ch/sitemap.xml`.
- Astro still generates `sitemap-index.xml` and `sitemap-0.xml`; the build also copies `sitemap-0.xml` to `sitemap.xml` as the public sitemap entry point.
- JSON-LD avoids unverified ratings, reviews, opening hours, and price-range claims.
