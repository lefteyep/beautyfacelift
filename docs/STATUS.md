# Project Status — beautyfacelift-zuerich.ch

**Last updated:** May 7, 2026 (post-launch documentation)

Current production launch record and verification commands are in [domain-launch-beautyfacelift-zuerich.md](domain-launch-beautyfacelift-zuerich.md). Do not configure or redirect `beautyfacelift.ch` from this project.

## Deployment

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://beautyfacelift-zuerich.ch | Live on Cloudflare Workers custom domain |
| Production www | https://www.beautyfacelift-zuerich.ch | 301 redirects to apex |
| Temporary Worker | beautyfacelift.mediapaulo.workers.dev | Not canonical; `workers_dev=false`, live check returned 404 |
| GitHub | https://github.com/lefteyep/beautyfacelift | Private repo |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Active (EU Frankfurt) |

Production Worker launch details:

- Worker: `beautyfacelift`
- Worker version: `f376e963-48cf-4708-9130-650ed6e48b4b`
- Nameservers: `ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com`
- Apex live check: `200 OK`
- `www` live check: `301 Moved Permanently` to `https://beautyfacelift-zuerich.ch/`
- Old domain: untouched and not treated as a migration source

## Site Map (24 pages)

### Main Pages
| Page | URL | Status |
|------|-----|--------|
| Homepage | / | Done — testimonials, 6 FAQs, 4 services, enriched schema |
| Treatment overview | /behandlungen/ | Done — breadcrumbs, guidance grid, 4 FAQs, comparison link |
| Hydrafacial | /behandlungen/hydrafacial-zuerich/ | Done — 3000+ words, pricing, 8 FAQs, process, testimonials |
| Microneedling | /behandlungen/microneedling-zuerich/ | Done — 3000+ words, pricing, 8 FAQs, process, testimonials |
| Fruchtsaeure Peeling | /behandlungen/fruchtsaeure-peeling-zuerich/ | Done — 3000+ words, pricing, 8 FAQs, process, testimonials |
| ColdPlasma | /behandlungen/coldplasma-zuerich/ | Done — 3000+ words, pricing, 7 FAQs, process, testimonials |
| Treatment comparison | /behandlungen/vergleich/ | Done — side-by-side comparison, 5 FAQs |
| About | /ueber-uns/ | Done — E-E-A-T bio, credentials, testimonials, Person schema |
| Booking | /termin/ | Done — H1, address, booking widget |
| Booking confirmation | /buchung-bestaetigt/ | Done — conversion tracking |
| FAQ hub | /haeufige-fragen/ | Done — 20 FAQs in 4 categories |
| Impressum | /impressum/ | Done |
| Datenschutz | /datenschutz/ | Done |
| 404 | /404 | Done |
| Admin | /admin/ | Done — noindex |

### Blog (5 articles)
| Article | URL | Words |
|---------|-----|-------|
| Blog index | /blog/ | — |
| Hydrafacial vs. Microneedling | /blog/hydrafacial-vs-microneedling/ | 2000+ |
| Hautpflege-Routine Zürich | /blog/hautpflege-routine-zuerich/ | 2000+ |
| Was ist Hydrafacial? | /blog/was-ist-hydrafacial/ | 2000+ |
| Microneedling Erfahrung | /blog/microneedling-erfahrung/ | 2000+ |
| Anti-Aging Behandlungen Zürich | /blog/anti-aging-behandlungen-zuerich/ | 2000+ |

### Ad Landing Pages (noindex)
| Page | URL |
|------|-----|
| Hydrafacial LP | /lp/hydrafacial/ |
| Microneedling LP | /lp/microneedling/ |
| Peeling LP | /lp/peeling/ |

## SEO & AIO Status

| Feature | Status | Details |
|---------|--------|---------|
| Schema.org (BeautySalon) | Done | Conservative BeautySalon/WebSite schema with canonical URL and address |
| Schema.org (Service) | Done | Treatment schemas avoid unverified rating/price rich-result claims |
| Schema.org (FAQPage) | Done | 60+ FAQ items sitewide with JSON-LD |
| Schema.org (Article) | Done | All 5 blog articles |
| Schema.org (Person) | Done | About page — Teresa Stimac |
| Schema.org (BreadcrumbList) | Done | Treatment pages, blog, FAQ hub |
| Schema.org (ItemList) | Done | Treatment overview |
| Sitemap | Done | Priority-weighted, admin/LP/confirmation filtered |
| robots.txt | Done | Sitemap directive uses production domain; Cloudflare Managed Content Signals are prepended live and should be reviewed if AI crawler access is intended |
| llms.txt | Done | Concise business summary for AI platforms |
| llms-full.txt | Done | Detailed version with treatments, pricing, 24 FAQs |
| Geo meta tags | Done | CH-ZH, lat/long, ICBM |
| max-image-preview:large | Done | All indexed pages |
| OG image dimensions | Done | 1200x630 |
| Article OG tags | Done | published_time, author, section |
| Canonical URLs | Done | Resolves to beautyfacelift-zuerich.ch |
| Image width/height | Done | All img tags have dimensions (CLS prevention) |
| Internal linking | Done | Cross-links between all treatment, blog, FAQ pages |

## Design Implementation (March 19, 2026)

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
| GTM + Partytown | Ready | Code in place, needs PUBLIC_GTM_ID env var |
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
