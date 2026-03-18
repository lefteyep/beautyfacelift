# Project Status — beautyfacelift.ch

**Last updated:** March 18, 2026 (after SEO/AIO overhaul)

## Deployment

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://beautyfacelift.pages.dev | Live (24 pages) |
| Custom Domain | beautyfacelift.ch | Not yet connected |
| GitHub | https://github.com/lefteyep/beautyfacelift | Private repo |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Active (EU Frankfurt) |

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
| Schema.org (HealthAndBeautyBusiness) | Done | Homepage — AggregateRating, reviews, OfferCatalog, geo, hours |
| Schema.org (Service) | Done | All 4 treatments — AggregateOffer, AggregateRating |
| Schema.org (FAQPage) | Done | 60+ FAQ items sitewide with JSON-LD |
| Schema.org (Article) | Done | All 5 blog articles |
| Schema.org (Person) | Done | About page — Teresa Stimac |
| Schema.org (BreadcrumbList) | Done | Treatment pages, blog, FAQ hub |
| Schema.org (ItemList) | Done | Treatment overview |
| Sitemap | Done | Priority-weighted, admin/LP/confirmation filtered |
| robots.txt | Done | 10 AI crawlers allowed (GPTBot, ClaudeBot, etc.) |
| llms.txt | Done | Concise business summary for AI platforms |
| llms-full.txt | Done | Detailed version with treatments, pricing, 24 FAQs |
| Geo meta tags | Done | CH-ZH, lat/long, ICBM |
| max-image-preview:large | Done | All indexed pages |
| OG image dimensions | Done | 1200x630 |
| Article OG tags | Done | published_time, author, section |
| Canonical URLs | Done | Resolves to beautyfacelift.ch |
| Image width/height | Done | All img tags have dimensions (CLS prevention) |
| Internal linking | Done | Cross-links between all treatment, blog, FAQ pages |

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
| Custom domain | Pending | Need to connect in Cloudflare |
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
- Admin user: info@pauloferreira.de / test123 (CHANGE BEFORE PRODUCTION)
- RLS policies: Active on all tables
- Edge Functions deployed: No (notify-booking not yet deployed)
