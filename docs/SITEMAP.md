# Sitemap

Public sitemap entry point:

```text
https://beautyfacelift-zuerich.ch/sitemap.xml
```

Astro generates `sitemap-index.xml` and `sitemap-0.xml`; the build copies `sitemap-0.xml` to `sitemap.xml` so the public robots directive and Search Console submission use the canonical production URL.

## Indexable Routes

- `/`
- `/behandlungen/`
- `/behandlungen/coldplasma-zuerich/`
- `/behandlungen/exosome-therapie-zuerich/`
- `/behandlungen/fruchtsaeure-peeling-zuerich/`
- `/behandlungen/hydrafacial-zuerich/`
- `/behandlungen/microneedling-zuerich/`
- `/behandlungen/vergleich/`
- `/blog/`
- `/blog/anti-aging-behandlungen-zuerich/`
- `/blog/hautpflege-routine-zuerich/`
- `/blog/hydrafacial-vs-microneedling/`
- `/blog/microneedling-erfahrung/`
- `/blog/was-ist-hydrafacial/`
- `/datenschutz/`
- `/haeufige-fragen/`
- `/impressum/`
- `/kontakt/`
- `/ueber-uns/`

## Excluded Routes

- `/admin/*`
- `/lp/*`
- `/buchung-bestaetigt/`
- `/kontakt/danke/`
- `/termin/`

Excluded routes are internal, noindex, redirect/support pages, or booking-flow pages that should not be submitted as public SEO landing pages.

Sitemap output must never contain `workers.dev`, `www.beautyfacelift-zuerich.ch`, or the old domain.

## Live Verification

Observed on 2026-05-07:

- `https://beautyfacelift-zuerich.ch/sitemap.xml` serves the public sitemap.
- All live sitemap `<loc>` values use `https://beautyfacelift-zuerich.ch`.
- `https://beautyfacelift-zuerich.ch/robots.txt` includes `Sitemap: https://beautyfacelift-zuerich.ch/sitemap.xml`.
- Cloudflare Managed Content Signals are prepended to live `robots.txt`; review Cloudflare AI Crawl Control settings if AI crawler access should follow only the repository-managed robots rules.
