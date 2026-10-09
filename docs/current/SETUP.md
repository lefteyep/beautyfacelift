# Setup Guide — beautyfacelift-zuerich.ch

Canonical production origin:

```text
https://beautyfacelift-zuerich.ch
```

This project is an Astro static site served through Cloudflare Workers Static Assets. The Worker entrypoint is `worker/index.ts`, API routes use `itty-router`, and production routing is configured in `wrangler.jsonc`.

Do not configure `beautyfacelift.ch` or `www.beautyfacelift.ch` for this Worker. That old domain remains separate.

## Local Development

```bash
cd astro-v2
npm install
npm run dev
```

`npm run dev` starts Astro at `http://localhost:4321` and is best for page/UI work.

For Worker and API verification:

```bash
cp .dev.vars.example .dev.vars
npm run build
npm run cf:dev
npm run qa:worker
```

Keep local `.env.local` and `.dev.vars` files untracked. Do not commit real secrets.

## Production Config

Production URL examples should use:

```env
SITE_URL=https://beautyfacelift-zuerich.ch
```

The canonical origin is hardcoded for build-time SEO in `shared/site.ts` and `astro.config.mjs`. Use `absoluteUrl()` from `shared/site.ts` for canonical, Open Graph, sitemap, JSON-LD, and internal absolute URL needs.

## Cloudflare Workers

Configured custom domains in `wrangler.jsonc`:

- `beautyfacelift-zuerich.ch`
- `www.beautyfacelift-zuerich.ch`

`workers_dev` is set to `false` for production to avoid an indexable duplicate. The Worker still contains a redirect for `beautyfacelift.mediapaulo.workers.dev` in case the temporary host remains reachable.

Production launch state as of 2026-05-07:

- apex custom domain is live
- `www` redirects to the apex
- workers.dev returns 404 because `workers_dev=false`
- all-inkl remains the registrar, while Cloudflare is authoritative DNS for the new domain

Validation:

```bash
npm run build
npm run launch:check
npx wrangler deploy --dry-run
```

Run `npm run cf:deploy` only as an intentional production release command. The 2026-05-07 launch deploy used Wrangler with `--keep-vars` so dashboard-set Worker variables were preserved.

## Environment Variables

Contact form (production values are Cloudflare Worker secrets):

- `TURNSTILE_SECRET_KEY` for production-equivalent contact form checks. The site key, `PUBLIC_TURNSTILE_SITE_KEY`, is a GitHub Actions variable.
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` for the enquiry emails.
- `CONTACT_BCC_EMAIL` (optional): blind-copy recipients, comma-separated. Set it only once `CONTACT_FROM_EMAIL` uses the domain verified in Resend. Resend's test sender `onboarding@resend.dev` only delivers to the account owner, and the whole email would fail.

Tracking (everything loads only after marketing consent):

- `PUBLIC_GTM_ID`: a GitHub Actions variable, `GTM-NVC9QKGS`. See [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md).
- `PUBLIC_META_PIXEL_ID` (build), plus `META_PIXEL_ID` and `META_ACCESS_TOKEN` (Worker, Conversions API).
- `GA4_MEASUREMENT_ID` and `GA4_API_SECRET`: server-side GA4 in `/api/track`. Leave them unset. GA4 runs through GTM, and both together would count events twice.

Legacy booking system only. The public site does not need these; Supabase has been unreachable since 2026-10-06, and removal is pending (see TODO):

- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Stripe keys: deposits were never enabled.

## Manual Launch

Use `docs/current/DOMAIN-LAUNCH.md` for the completed all-inkl nameserver setup, Cloudflare Custom Domain setup, Search Console, Google Business Profile, analytics, and curl verification record.
