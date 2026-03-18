# Project Status — beautyfacelift.ch

**Last updated:** March 18, 2026

## Deployment

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://beautyfacelift.pages.dev | Live |
| Custom Domain | beautyfacelift.ch | Not yet connected |
| GitHub | https://github.com/lefteyep/beautyfacelift | Private repo |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Active (EU Frankfurt) |

## Feature Completion

| Feature | Status | Notes |
|---------|--------|-------|
| Homepage | Done | Hero, services, about, CTAs |
| Treatment pages (4) | Done | Hydrafacial, Microneedling, Peeling, ColdPlasma |
| Treatment overview | Done | /behandlungen/ with grid |
| About page | Done | /ueber-uns/ — Teresa, studio |
| Legal pages | Done | /impressum/, /datenschutz/ |
| 404 page | Done | Branded error page |
| Ad landing pages (3) | Done | /lp/hydrafacial/, /lp/microneedling/, /lp/peeling/ |
| Mobile hamburger menu | Done | Full-screen overlay, accessible |
| FAQ accordion | Done | details/summary, CSS animated |
| Breadcrumbs | Done | Visual + BreadcrumbList schema |
| Booking widget | Done | 5-step flow, writes to Supabase |
| Admin dashboard | Done | Login, bookings, services, availability, blocked dates, CSV export |
| GSAP animations | Done | Bundled npm, reduced-motion support |
| Local fonts | Done | @fontsource latin-only |
| Schema.org | Done | All pages have structured data |
| Sitemap | Done | Auto-generated |
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
