# Project Status — beautyfacelift-zuerich.ch

**Last updated:** October 7, 2026

This file is the current status source of truth. Historical implementation notes live under `docs/archive/`.

Current production launch record and verification commands are in [DOMAIN-LAUNCH.md](DOMAIN-LAUNCH.md). Do not configure or redirect `beautyfacelift.ch` from this project.

Latest release notes: [RELEASE-2026-05-08-live-update.md](../archive/releases/RELEASE-2026-05-08-live-update.md) and [SEO-SERVICE-HUBS-2026-05-08.md](../archive/releases/SEO-SERVICE-HUBS-2026-05-08.md). Delivery details are in [DELIVERY-2026-05-08.md](../archive/releases/DELIVERY-2026-05-08.md).

## Deployment

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://beautyfacelift-zuerich.ch | Live on Cloudflare Workers custom domain |
| Production www | https://www.beautyfacelift-zuerich.ch | 301 redirects to apex |
| Temporary Worker | beautyfacelift.mediapaulo.workers.dev | Not canonical; `workers_dev=false`, live check returned 404 |
| GitHub | https://github.com/lefteyep/beautyfacelift | Private repo |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Unreachable (NXDOMAIN) since 2026-10-06 — see Infrastructure Notes |

Production Worker launch details:

- Worker: `beautyfacelift`
- Worker version: `f376e963-48cf-4708-9130-650ed6e48b4b`
- Latest SEO service hub deployment: `e1df2f1a-197f-4b8d-934b-86b5b2bf00c6`
- Nameservers: `ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com`
- Apex live check: `200 OK`
- `www` live check: `301 Moved Permanently` to `https://beautyfacelift-zuerich.ch/`
- Old domain: untouched and not treated as a migration source

## Pending Release (not live yet)

| Branch | Contents | State |
|--------|----------|-------|
| `codex/code-health-2026-10` | npm audit fix (0 vulnerabilities, CI gate passes again), restored `trackLead` for the Aquafacial + Microneedling LP (Lead events had silently stopped in June), hashed email/phone on the Aquafacial CAPI Lead, re-openable cookie consent ("Cookie-Einstellungen"), compact mobile consent banner, `npm run check` at 0 errors, `src/api_backup/` removed | Ready for review |
| `codex/modern-redesign` | "Atelier Glow" redesign on top of code health — see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). It supersedes the rejected "Swiss Quiet Luxury" branch `codex/luxury-redesign`. It includes: |  |
|  | new navigation with a two-column treatments menu, homepage and `/behandlungen/` overview |  |
|  | overlines and italics removed site-wide, and "Wissen" instead of "Journal" |  |
|  | redesigned ad landing pages |  |
|  | the merged page groups: `codex/glow-hubs` (service hubs), `codex/glow-treatments` (treatment pages, comparison, kit, breadcrumbs), `codex/glow-content` (About, Kontakt, FAQ, utility pages), `codex/glow-wissen` (Wissen section) | All release gates pass; awaiting screenshot review and approval |

Nothing above is deployed until merged to `master` with explicit approval (see `AGENTS.md`). The client wants the redesign to launch as one release, once all page groups are merged, reviewed with desktop and mobile screenshots, and documented.

## Infrastructure Notes (2026-10-06)

- Supabase project `izekwngqjllaqibrwotp` did not resolve (NXDOMAIN) on 2026-10-06, so `/api/services` returns 500 and the admin dashboard / legacy booking widget are unusable. The contact form (Resend) and `/api/track` (Meta CAPI) do not depend on Supabase. Decide: restore the project (needed for lead status tracking) or decommission the legacy booking code.
- Meta Pixel ID is present in the production build (`PUBLIC_META_PIXEL_ID` GitHub Actions variable). Server-side CAPI token status still needs a Test Events check.
- The old WordPress site on `beautyfacelift.ch` is still live and indexed separately.

## Current Key Routes

### Main Pages
All main pages use the "Atelier Glow" system (October 2026). There are no overlines, no italics and no facts asides; each hero has one lead sentence. Counts below are FAQPage JSON-LD questions.

| Page | URL | Status |
|------|-----|--------|
| Homepage | / | Hero with proof line, treatments bento, Teresa, beauty services with starting prices, first-visit steps, reviews, 6 FAQs |
| Treatment overview | /behandlungen/ | Image cards for facial treatments, price rows for beauty services, guide, 4 FAQs, ItemList schema |
| Gesichtsbehandlung Zürich | /behandlungen/gesichtsbehandlung-zuerich/ | Service hub (ServiceHubPage) with a photo hero, price rows, a "Was Sie erwartet" spec list and Service schema |
| Aquafacial | /behandlungen/aquafacial-zuerich/ | Treatment page: hero with price/duration, benefits, price rows, steps, suitability, review, 7 FAQs, booking panel, related treatments |
| Microneedling | /behandlungen/microneedling-zuerich/ | Same treatment-page structure, 8 FAQs |
| Fruchtsäure Peeling | /behandlungen/fruchtsaeure-peeling-zuerich/ | Same treatment-page structure, 8 FAQs |
| ColdPlasma | /behandlungen/coldplasma-zuerich/ | Same treatment-page structure, 7 FAQs |
| Exosome Therapie | /behandlungen/exosome-therapie-zuerich/ | Same treatment-page structure with cautious wording, 9 FAQs |
| Treatment comparison | /behandlungen/vergleich/ | Hairline table on desktop, stacked cards below 1000 px, 5 FAQs |
| Laser-Haarentfernung Zürich | /behandlungen/laser-haarentfernung-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Waxing Zürich | /behandlungen/waxing-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Wimpern & Brauen Zürich | /behandlungen/wimpern-brauen-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Make-up Zürich | /behandlungen/make-up-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Massage Zürich Bahnhofstrasse | /behandlungen/massage-zuerich-bahnhofstrasse/ | Service hub with a typographic hero, price rows and spec list |
| About | /ueber-mich/ | Portrait hero, story with stats, four principles, three reviews, studio CTA, Person schema |
| Kontakt | /kontakt/ | Contact tiles; enquiry form with an unchanged field/Turnstile/tracking contract; location and hours; 6 FAQs |
| Booking | /termin/ | Noindex Treatwell forwarding bridge with attribution handoff (IDs and script unchanged) |
| Booking confirmation | /buchung-bestaetigt/ | Legacy first-party booking confirmation; not the active Treatwell conversion source |
| FAQ hub | /haeufige-fragen/ | 20 FAQs in 4 groups with a sticky topic index |
| Impressum | /impressum/ | Layout refresh only; legal text unchanged |
| Datenschutz | /datenschutz/ | Layout refresh with a sticky table of contents; legal text unchanged |
| 404 | /404 | Short page with four next-step links |
| Admin | /admin/ | Noindex |

### Wissen (blog, 5 articles; URL stays /blog/)
| Article | URL | Notes |
|---------|-----|-------|
| Wissen index | /blog/ | Feature card, article rows, consultation panel, CollectionPage schema |
| Aquafacial vs. Microneedling | /blog/aquafacial-vs-microneedling/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Hautpflege-Routine Zürich | /blog/hautpflege-routine-zuerich/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Was ist Aquafacial? | /blog/was-ist-aquafacial/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Microneedling Erfahrung | /blog/microneedling-erfahrung/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Anti-Aging Behandlungen Zürich | /blog/anti-aging-behandlungen-zuerich/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |

Article body copy is unchanged. Its unverified claims are listed in [TODO.md](TODO.md).

### Ad Landing Pages (noindex)
| Page | URL |
|------|-----|
| Aquafacial LP | /lp/aquafacial/ |
| Microneedling LP | /lp/microneedling/ |
| Peeling LP | /lp/peeling/ |
| Aquafacial Aktion (Meta lead form, CHF 99) | /lp/aquafacial/ |
| Aquafacial + Microneedling (combo) | /lp/aquafacial-microneedling/ |
| Carbon Microneedling | /lp/carbon-microneedling/ |

## SEO & AIO Status

| Feature | Status | Details |
|---------|--------|---------|
| Schema.org (BeautySalon) | Done | Conservative BeautySalon/WebSite schema with canonical URL and address |
| Schema.org (Service) | Done | Treatment schemas avoid unverified rating/price rich-result claims |
| Schema.org (FAQPage) | Done | 105 FAQ items sitewide with JSON-LD (generated from the same data as the visible FAQs) |
| Schema.org (Article) | Done | All 5 blog articles |
| Schema.org (Person) | Done | About page — Teresa Stimac |
| Schema.org (BreadcrumbList) | Done | Treatment pages, blog, FAQ hub |
| Schema.org (ItemList) | Done | Treatment overview |
| Sitemap | Done | Priority-weighted, admin/LP/confirmation filtered |
| robots.txt | Done | Sitemap directive uses production domain; Cloudflare Managed Content Signals are prepended live and should be reviewed if AI crawler access is intended |
| llms.txt | Done | Concise business summary for AI platforms, including six service groups |
| llms-full.txt | Done | Detailed version with treatments, service hubs, pricing, and FAQs |
| Geo meta tags | Done | CH-ZH, lat/long, ICBM |
| max-image-preview:large | Done | All indexed pages |
| OG image dimensions | Done | 1200x630 |
| Article OG tags | Done | published_time, author, section |
| Canonical URLs | Done | Resolves to beautyfacelift-zuerich.ch |
| Image width/height | Done | All img tags have dimensions (CLS prevention) |
| Internal linking | Done | Cross-links between treatment hubs, treatment detail pages, blog, and FAQ pages |

## SEO Service Hub Release (2026-05-08)

The site now uses a grouped service architecture from `SERVICE_GROUPS` in `shared/site.ts`.

Implemented groups:

- Gesicht & Haut
- Laser-Haarentfernung
- Waxing
- Wimpern & Brauen
- Make-up
- Massage

Visible architecture updated in:

- homepage service section
- desktop and mobile treatment navigation
- footer treatment links
- treatment overview
- `llms.txt` and `llms-full.txt`
- sitemap output

Copy-risk review completed across treatment pages, comparison pages, blog posts, homepage, about page, and one ad landing page. High-risk phrasing such as `eingeschleust`, `Narbenreduktion`, `stimuliert`, `PRP`, and `medizinisch formulierte Peelings` was removed or softened.

## Design History

The March 2026 ".pen" implementation below is superseded on the redesign branch by the October 2026 "Swiss Quiet Luxury" system ([DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)).

### Design Implementation (March 19, 2026)

Pixel-perfect redesign from `.pen` design file applied across all 24 pages.

| Area | Changes |
|------|---------|
| **Homepage** | Hero: 72px heading, 18px body, service cards with gold accent left border, testimonials with star ratings, editorial grid layout |
| **Navigation** | Refined spacing (18px 60px padding), logo 42px height, pill-shaped gold CTA, improved mobile menu |
| **Footer** | 3-column layout with 320px horizontal padding, newsletter input with inline button, proper link spacing |
| **Treatment pages** | Pricing cards with `.pricing-card-accent` variant, FAQ sections with 320px padding, sub-display span labels |
| **Behandlungen overview** | Editorial guidance grid, proper card gaps, gold accent decorations |
| **Blog** | Card grid with hover lift effects, article typography with drop cap, improved reading layout |
| **404 page** | Centered layout with design-system typography and gold accent |
| **Termin page** | Booking section with proper padding and heading hierarchy |
| **CSS tokens** | Updated spacing scale, border-radius (24px cards, 100px pills), gold gradient, shadow system |

**Commit:** `48fb053` — 14 files changed, 789 insertions, 387 deletions

## Feature Completion

| Feature | Status | Notes |
|---------|--------|-------|
| Booking widget | Done | 5-step flow, writes to Supabase |
| Admin dashboard | Done | Login, bookings, services, availability, blocked dates, CSV export |
| GSAP animations | Done | Bundled npm, reduced-motion support |
| Local fonts | Done | @fontsource latin-only |
| UTM persistence | Done | sessionStorage capture |
| Server-side tracking | Done | /api/track endpoint |
| Conversion tracking | Done | Thank-you page fires client + server events |
| Stripe deposits | Partial | Components + API created, not wired into booking flow |
| Email notifications | Created | Edge function written, not deployed |
| Custom domain | Done | Live on `beautyfacelift-zuerich.ch`; `www` redirects to apex |
| GTM | Ready | `src/lib/track.ts` loads GTM after marketing consent once PUBLIC_GTM_ID is set (Partytown removed 2026-10-06: no script used it and its sandbox cost requests plus a Lighthouse best-practices failure) |
| GA4 | Ready | Endpoint ready, needs env vars |
| Meta Pixel | Ready | Endpoint ready, needs env vars |

## Environment Variables Status

| Variable | Set in Cloudflare? | Working? |
|----------|-------------------|----------|
| PUBLIC_SUPABASE_URL | Yes | Yes |
| PUBLIC_SUPABASE_ANON_KEY | Yes | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Untested (anon key fallback works) |
| NODE_VERSION | Yes (22) | Yes |
| PUBLIC_STRIPE_PUBLISHABLE_KEY | No | — |
| STRIPE_SECRET_KEY | No | — |
| STRIPE_WEBHOOK_SECRET | No | — |
| RESEND_API_KEY | No | — |
| PUBLIC_GTM_ID | No | — |
| GA4_MEASUREMENT_ID | No | — |
| GA4_API_SECRET | No | — |
| META_PIXEL_ID | No | — |
| META_ACCESS_TOKEN | No | — |

## Supabase Database

- Schema applied: Yes (001_initial_schema.sql)
- Seed data: 6 services, 7 availability records, 2 settings
- Admin user: Supabase Auth owner account exists, but weak/test credentials must be replaced before production customer data is exposed.
- RLS policies: Active on all tables
- Edge Functions deployed: Needs verification before relying on production notification email
