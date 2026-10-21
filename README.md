# Beauty Face Lift Zürich

Astro static site served by a Cloudflare Worker with Static Assets and API routes.

Canonical production origin:

```text
https://beautyfacelift-zuerich.ch
```

The temporary `beautyfacelift.mediapaulo.workers.dev` host must not be used as a public canonical URL. The Worker contains a redirect map for the old `beautyfacelift.ch` site; it remains inert until the user completes the approved DNS cutover. Preserve mail records and follow `docs/current/OLD-SITE-SHUTDOWN.md`. This repair milestone does not change DNS or activate the redirect.

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
npm run validate
npm run cf:dev
npm run qa:worker
npm run launch:check
npx wrangler deploy --dry-run
```

`npm run validate` runs the release checks locally with stubbed application services. CI runs it with Node 22 and npm 10.9.9 before any production migration or deployment. Production deployment uses the reviewed GitHub workflow on `master` and requires explicit approval; do not run `npm run cf:deploy` or `wrangler deploy` manually.

## Documentation

Start with [docs/README.md](docs/README.md). Current operating docs live in `docs/current/`; historical release notes and old implementation records live in `docs/archive/`.

## Domain Launch

Production Workers custom domains are configured in `wrangler.jsonc`:

- `beautyfacelift-zuerich.ch`
- `www.beautyfacelift-zuerich.ch`

`www.beautyfacelift-zuerich.ch` redirects to `https://beautyfacelift-zuerich.ch` in the Worker before API or asset handling. `workers_dev` is disabled for production; if the temporary workers.dev host still reaches the Worker, it also redirects to the canonical apex.

The custom-domain launch was completed on 2026-05-07. The deployed Worker version recorded for that launch is `f376e963-48cf-4708-9130-650ed6e48b4b`.

The full DNS, all-inkl, Cloudflare, Search Console, and verification record lives in `docs/current/DOMAIN-LAUNCH.md`.

## SEO Outputs

- Canonicals and Open Graph URLs use `https://beautyfacelift-zuerich.ch`.
- `robots.txt` points to `https://beautyfacelift-zuerich.ch/sitemap.xml`.
- Astro still generates `sitemap-index.xml` and `sitemap-0.xml`; the build also copies `sitemap-0.xml` to `sitemap.xml` as the public sitemap entry point.
- JSON-LD avoids unverified ratings, reviews, opening hours, and price-range claims.
