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
- `/behandlungen/gesichtsbehandlung-zuerich/`
- `/behandlungen/hydrafacial-zuerich/`
- `/behandlungen/laser-haarentfernung-zuerich/`
- `/behandlungen/make-up-zuerich/`
- `/behandlungen/massage-zuerich-bahnhofstrasse/`
- `/behandlungen/microneedling-zuerich/`
- `/behandlungen/vergleich/`
- `/behandlungen/waxing-zuerich/`
- `/behandlungen/wimpern-brauen-zuerich/`
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
- `/ueber-mich/`

## Excluded Routes

- `/admin/*`
- `/lp/*`
- `/buchung-bestaetigt/`
- `/kontakt/danke/`
- `/termin/`

Excluded routes are internal, noindex, redirect/support pages, or booking-flow pages that should not be submitted as public SEO landing pages.

Sitemap output must never contain `workers.dev`, `www.beautyfacelift-zuerich.ch`, or the old domain.

## Live Verification

Observed on 2026-05-08 after the SEO service hub build:

- `https://beautyfacelift-zuerich.ch/sitemap.xml` serves the public sitemap.
- All live sitemap `<loc>` values use `https://beautyfacelift-zuerich.ch`.
- `https://beautyfacelift-zuerich.ch/robots.txt` includes `Sitemap: https://beautyfacelift-zuerich.ch/sitemap.xml`.
- The sitemap includes the six new service hub routes for Gesichtsbehandlung, Laser-Haarentfernung, Waxing, Wimpern & Brauen, Make-up, and Massage.
- Cloudflare Managed Content Signals are prepended to live `robots.txt`; review Cloudflare AI Crawl Control settings if AI crawler access should follow only the repository-managed robots rules.
