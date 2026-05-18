# SEO Service Hubs - 2026-05-08

This document records the SEO and copy architecture update for Beauty Face Lift Zürich.

Production domain:

```text
https://beautyfacelift-zuerich.ch
```

Working branch:

```text
codex/project-safety-rules
```

## Goal

Create a broader, reader-friendly local SEO structure without keyword stuffing or exaggerated cosmetic/medical claims.

Primary search intents covered:

- `Kosmetikstudio Zürich`
- `Gesichtsbehandlung Zürich`
- `Laser-Haarentfernung Zürich`
- `Waxing Zürich`
- `Wimpern & Brauen Zürich`
- `Make-up Zürich`
- `Massage Zürich Bahnhofstrasse`

## Strategy Decisions

- The homepage remains the primary page for `Kosmetikstudio Zürich Bahnhofstrasse`.
- No separate `/kosmetikstudio-bahnhofstrasse-zuerich/` page was created, to avoid thin duplicate content.
- Review and aggregate rating schema were not added for LocalBusiness snippets.
- FAQ content remains useful for readers, but FAQPage markup is not treated as the main SEO lever.
- Texts were tightened for helpfulness and realistic expectations rather than inflated word count.
- Swiss High German remains the copy standard.

## Service Architecture

The shared service architecture now lives in:

```text
shared/site.ts
```

The new `SERVICE_GROUPS` export defines six service groups:

- Gesicht & Haut
- Laser-Haarentfernung
- Waxing
- Wimpern & Brauen
- Make-up
- Massage

This shared data now drives the visible treatment navigation, footer treatment links, homepage service cards, treatment overview, and service schema sources.

## New SEO Landing Pages

Added indexable service hub pages:

| Route | Primary intent | Booking service |
|---|---|---|
| `/behandlungen/gesichtsbehandlung-zuerich/` | Users who need a general skin-treatment entry point | `Gesichtsbehandlungen` |
| `/behandlungen/laser-haarentfernung-zuerich/` | High-intent laser hair removal searches | `Dauerhafte Haarentfernung` |
| `/behandlungen/waxing-zuerich/` | High-intent waxing searches | `Waxing` |
| `/behandlungen/wimpern-brauen-zuerich/` | Brow and lash grooming searches | `Augenbrauen & Wimpern` |
| `/behandlungen/make-up-zuerich/` | Occasion and professional make-up searches | `Make-Up` |
| `/behandlungen/massage-zuerich-bahnhofstrasse/` | Local massage searches near Bahnhofstrasse | `Massagen` |

All six pages use the shared `ServiceHubPage.astro` component and include:

- clear H1 and meta description
- two concise intro paragraphs
- price and duration signals
- suitability guidance
- treatment/process outline
- realistic expectations
- contraindication note
- booking CTA with `?service=...`
- internal links to related treatments
- Breadcrumb JSON-LD
- Service JSON-LD matching visible page content

## Homepage And Overview Updates

Homepage updates:

- Meta description now matches the visible service range.
- Added a visible service section for the six service groups.
- Local SEO copy includes the new high-intent phrases naturally in one reader-friendly paragraph.
- Homepage `hasOfferCatalog` now reflects the full shared service structure.

Treatment overview updates:

- The overview now presents grouped service areas instead of only five skin-treatment pages.
- ItemList schema now derives from `SERVICE_GROUPS`.
- Intro copy explains Beauty Face Lift as a cosmetic studio with skin treatments as the premium focus.

Navigation and footer updates:

- Desktop treatment dropdown is grouped by service area.
- Mobile treatment menu uses the same grouped structure.
- Footer treatment links now point to the six service hubs plus the comparison page.

## Copy Claim Review

Risky or overly strong phrasing was softened across treatment pages, comparison pages, blog posts, the homepage, the about page, and one ad landing page.

Removed or replaced high-risk patterns include:

- `revolutionäre Technologie`
- `tief in die Haut eingeschleust`
- `medizinisch formulierte Peelings`
- `Kollagen-Induktionstherapie`
- `PRP`
- `Narbenreduktion`
- `Infektionsrisiko`
- `stimuliert`
- `wirksamsten`

Replacement tone:

- `kann unterstützen`
- `je nach Hautzustand`
- `kosmetische Verbesserung`
- `sichtbar feiner wirken`
- `realistische Erwartungen`
- `Teresa entscheidet nach Hautzustand, Verträglichkeit und Ziel`

## Technical SEO

- `llms.txt` and `llms-full.txt` now include the six service hubs.
- Sitemap output includes all six new indexable routes.
- Canonicals resolve to `https://beautyfacelift-zuerich.ch`.
- New service pages include Service schema only where visible page content matches the schema.
- No review-star schema or aggregate rating schema was added.
- Contact page no longer renders the technical local Turnstile fallback note to visitors.

## Verification

Fresh verification before deployment:

```powershell
node scripts\seo-plan-smoke.mjs
npm run build
```

Additional static output checks:

- all six new routes build to `dist`
- each new page has the expected canonical
- each new page is present in sitemap output
- each new page contains Breadcrumb and Service JSON-LD
- homepage/contact/new service pages do not contain `aggregateRating`, `"review":`, or the visible Turnstile fallback note

Browser checks performed against local preview:

- desktop homepage and grouped treatment dropdown
- homepage service-group section
- mobile laser landing page H1 wrapping
- mobile treatment menu grouped disclosure

## Deployment Plan

Deployment target is Cloudflare Workers using:

```powershell
npm run cf:deploy
```

Post-deploy smoke checks:

- homepage returns `200`
- all six new landing pages return `200`
- production sitemap contains all six new URLs
- `/kontakt/` does not show the local Turnstile fallback note
- `/api/services` returns JSON

## Production Deployment Record

Deployment used the project script:

```powershell
npm run cf:deploy
```

Cloudflare result:

```text
Worker: beautyfacelift
Version ID: e1df2f1a-197f-4b8d-934b-86b5b2bf00c6
Routes:
- beautyfacelift-zuerich.ch
- www.beautyfacelift-zuerich.ch
```

Post-deploy smoke checks completed on 2026-05-08:

- `https://beautyfacelift-zuerich.ch/` returned `200` and contains the new service-group homepage copy.
- All six new service hub routes returned `200` and contained their target service copy.
- `https://beautyfacelift-zuerich.ch/kontakt/` returned `200` and did not contain the local Turnstile fallback note.
- `https://beautyfacelift-zuerich.ch/sitemap.xml` returned `200` and contains all six new service hub URLs.
- `https://beautyfacelift-zuerich.ch/api/services` returned `200` with 65 services.
- `https://www.beautyfacelift-zuerich.ch/` returned `301` to `https://beautyfacelift-zuerich.ch/`.
