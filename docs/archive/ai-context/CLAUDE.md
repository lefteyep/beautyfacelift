# Beauty Face Lift — Claude Project Context

> **Historical (March 2026).** Not loaded and not current. The active Claude context is [/CLAUDE.md](../../../CLAUDE.md).

## Project Identity

- **Client:** Beauty Face Lift — Premium Medical Spa, Bahnhofstrasse 94, 8001 Zurich, Switzerland
- **Owner:** Teresa Stimac
- **Domain:** beautyfacelift.ch (not yet connected — currently live at beautyfacelift.pages.dev)
- **GitHub:** https://github.com/lefteyep/beautyfacelift (private)
- **Live URL:** https://beautyfacelift.pages.dev
- **Supabase:** https://izekwngqjllaqibrwotp.supabase.co (EU West / Frankfurt)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Astro | 6.0.5 |
| Hosting | Cloudflare Workers Static Assets (unified) | Free tier |
| Database | Supabase (Postgres + Auth) | Free tier, EU Frankfurt |
| UI Islands | React | 19.2.4 |
| Payments | Stripe (optional deposits) | Not yet configured |
| CSS | Vanilla CSS with custom properties | No Tailwind |
| Animations | GSAP + ScrollTrigger | 3.14.2 (npm bundled) |
| Fonts | @fontsource (Cormorant Garamond display + Inter body + JetBrains Mono labels) | Latin-only subsets |
| Tracking | GTM via Partytown + server-side Meta CAPI + GA4 | Not yet configured |
| Emails | Resend (via Supabase Edge Function) | Not yet configured |

## Architecture Decisions

- **Static output mode** (`output: 'static'`) — all 24 pages are pre-rendered HTML served from the Workers `ASSETS` binding. No Astro adapter is used.
- **Unified Worker at `worker/index.ts`** — uses `itty-router` to dispatch 5 `/api/*` routes, falls through to `ASSETS` for everything else. `run_worker_first: ["/api/*"]` in `wrangler.jsonc` ensures static paths skip the Worker entirely.
- **Deployment via Wrangler + GitHub Actions** — `wrangler deploy` runs on push to `master` via `.github/workflows/deploy.yml`. No more Pages git-integration. See `docs/MIGRATION.md` for full migration details.
- **React islands only where interactivity is needed** — BookingWidget (`client:visible` on treatment pages, `client:load` on /termin/), AdminDashboard (`client:load`). All other pages ship zero JavaScript (except GSAP animations).
- **No Tailwind** — the client's existing vanilla CSS design system with custom properties is maintained.
- **GSAP bundled via npm** (not CDN) — eliminates render-blocking external scripts.
- **Fonts via @fontsource** (latin-only) — eliminates Google Fonts external request.

## File Structure

```
astro-v2/
├── astro.config.mjs          # Astro config: static output, sitemap, react, partytown
├── wrangler.jsonc             # Cloudflare Workers config (ASSETS binding, run_worker_first)
├── .dev.vars.example          # Template for local wrangler-dev env vars
├── worker/
│   ├── index.ts               # Worker entry — itty-router + ASSETS fallthrough
│   ├── env.ts                 # Shared Env interface
│   └── routes/
│       ├── services.ts        # GET /api/services — active treatments from Supabase
│       ├── availability.ts    # GET /api/availability — available dates for a month
│       ├── slots.ts           # GET /api/slots — time slots for date + service
│       ├── bookings.ts        # POST /api/bookings — create booking (conflict check)
│       └── track.ts           # POST /api/track — server-side tracking (Meta CAPI + GA4)
├── .github/workflows/deploy.yml  # CI deploy pipeline (wrangler deploy on push to master)
├── src/
│   ├── components/
│   │   ├── Nav.astro           # Navigation + mobile hamburger
│   │   ├── Footer.astro        # Footer + legal links + mobile sticky CTA
│   │   ├── Marquee.astro       # Infinite scroll marquee
│   │   ├── TreatmentLinkCard.astro  # Cross-navigation card
│   │   ├── Breadcrumbs.astro   # Breadcrumbs + BreadcrumbList schema
│   │   ├── booking/            # React booking widget (9 components)
│   │   │   ├── BookingWidget.tsx     # 5-step orchestrator
│   │   │   ├── steps/               # TreatmentSelect, DateSelect, TimeSelect, CustomerForm, DepositStep
│   │   │   └── ui/                  # Calendar, StepIndicator, ErrorBoundary
│   │   └── admin/              # React admin dashboard (7 components)
│   │       ├── AdminDashboard.tsx    # Shell + tab routing
│   │       ├── LoginForm.tsx
│   │       ├── BookingsList.tsx
│   │       ├── ServiceManager.tsx
│   │       ├── AvailabilityEditor.tsx
│   │       ├── BlockedDatesManager.tsx
│   │       └── CustomerExport.tsx
│   ├── layouts/
│   │   ├── Base.astro          # Main layout (meta, fonts, GSAP, UTM, GTM)
│   │   └── LandingPage.astro   # Stripped layout for ad landing pages
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client (with graceful fallback)
│   │   ├── stripe.ts           # Stripe.js loader
│   │   └── validation.ts       # Swiss phone, email, date validation
│   ├── pages/                  # 24 pages (all static pre-rendered)
│   │   ├── index.astro                              # Homepage (testimonials, 6 FAQs, 4 services)
│   │   ├── behandlungen/index.astro                 # Treatment overview (breadcrumbs, guidance, FAQ)
│   │   ├── behandlungen/hydrafacial-zuerich/        # 3000+ words, pricing, 8 FAQs, booking
│   │   ├── behandlungen/microneedling-zuerich/      # 3000+ words, pricing, 8 FAQs, booking
│   │   ├── behandlungen/fruchtsaeure-peeling-zuerich/ # 3000+ words, pricing, 8 FAQs, booking
│   │   ├── behandlungen/coldplasma-zuerich/         # 3000+ words, pricing, 7 FAQs, booking
│   │   ├── behandlungen/vergleich/                  # Treatment comparison page
│   │   ├── blog/index.astro                         # Blog listing
│   │   ├── blog/hydrafacial-vs-microneedling/       # Blog article (2000+ words)
│   │   ├── blog/hautpflege-routine-zuerich/         # Blog article (2000+ words)
│   │   ├── blog/was-ist-hydrafacial/                # Blog article (2000+ words)
│   │   ├── blog/microneedling-erfahrung/            # Blog article (2000+ words)
│   │   ├── blog/anti-aging-behandlungen-zuerich/    # Blog article (2000+ words)
│   │   ├── haeufige-fragen/                         # FAQ hub (20 FAQs, 4 categories)
│   │   ├── ueber-uns/                               # About Teresa (E-E-A-T, credentials)
│   │   ├── termin/                                  # Full booking page
│   │   ├── buchung-bestaetigt/                      # Confirmation + tracking
│   │   ├── admin/                                   # Admin dashboard (noindex)
│   │   ├── impressum/                               # Legal
│   │   ├── datenschutz/                             # Privacy
│   │   ├── lp/hydrafacial/                          # Ad landing page (noindex)
│   │   ├── lp/microneedling/                        # Ad landing page (noindex)
│   │   ├── lp/peeling/                              # Ad landing page (noindex)
│   │   └── 404.astro                                # Error page
│   ├── styles/
│   │   ├── main.css            # Design tokens, typography, buttons, .sr-only
│   │   ├── components.css      # Nav, hero, marquee, services, FAQ, footer, responsive
│   │   ├── booking.css         # Booking widget styles
│   │   ├── admin.css           # Admin dashboard styles
│   │   └── blog.css            # Blog article + listing styles
│   └── api_backup/             # Original Astro API routes (saved, not used)
├── supabase/
│   ├── migrations/001_initial_schema.sql  # Full DB schema + seed data
│   └── functions/notify-booking/index.ts  # Edge function for email notifications
├── public/                     # Static assets
├── docs/                       # Project documentation
├── .env.example                # All required env vars documented
└── PRD.md                      # Original Product Requirements Document
```

## Design System — Atelier

Warm paper neutrals + a single dark gold accent. Cormorant Garamond for display, Inter for body, JetBrains Mono for labels. No italics, no gradients, no ambient glows — emphasis through weight + colour + serif.

**Live reference:** `/admin/design-system` (noindex). Pinned to Atelier spec via inline tokens so it stays correct even if site CSS drifts.

Canonical tokens (in `src/styles/main.css :root`):

```css
/* Paper neutrals */
--paper: #F6F1EA; --paper-2: #EFE8DE; --paper-3: #E6DCCE; --bone: #FBF8F3;
/* Ink */
--ink: #1C1A17; --ink-2: #3B3731; --ink-3: #6E665B;
/* Gold — the only accent */
--gold: #B98F47; --gold-deep: #8E6A2E; --gold-soft: #E8D9B5;

/* Shadows */
--shadow-1: 0 1px 2px rgba(28,26,23,.04), 0 2px 6px rgba(28,26,23,.04);
--shadow-2: 0 4px 14px rgba(28,26,23,.06), 0 12px 32px rgba(28,26,23,.06);

/* Radii */
--r-sm: 4px; --r-md: 8px; --r-lg: 14px; --r-xl: 22px; --r-pill: 999px;

/* Type */
--f-display: "Cormorant Garamond", "Times New Roman", serif;
--f-body:    "Inter", ui-sans-serif, system-ui, sans-serif;
--f-mono:    "JetBrains Mono", ui-monospace, monospace;
```

**Legacy aliases** (`--bg-primary`, `--accent`, `--font-serif`, `--gold-gradient`, etc.) are retained and resolve through the canonical tokens so existing pages keep working. New code should prefer canonical names.

**Rules:**
- No `font-style: italic;` anywhere. Emphasise with `font-weight: 300` + `color: var(--gold)` on Cormorant (see `.accent-word` helper).
- No gradients. `--gold-gradient` aliases to solid `var(--gold)`.
- No glows/filters on interactive elements. `--gold-glow` aliases to `none`.
- `.pill-btn` is solid `--gold`, hover `--gold-deep`, shadow-1 → shadow-2.

Single responsive breakpoint: `@media (max-width: 900px)`

## Current Status (April 15, 2026 — migrated to Cloudflare Workers)

### Session references
- **[PENDING-WORK.md](../feature-notes/PENDING-WORK.md)** — historical list of post-launch blockers and priorities.
- **[LAYOUT-SYSTEM.md](../design-notes/LAYOUT-SYSTEM.md)** — sitewide 1920 full-bleed / 1240 content-cap layout + hero typography refinement (2026-04-20).
- **[HERO-LAYOUT-REVISION.md](../design-notes/HERO-LAYOUT-REVISION.md)** — earlier two-column hero rework (2026-04-20).
- **[IMAGES.md](../design-notes/IMAGES.md)** — image brief with AI generation prompts for each placeholder image.
- **[MIGRATION.md](../migration/MIGRATION.md)** — Cloudflare Pages → Workers migration context.
- **[CUTOVER-RUNBOOK.md](../migration/CUTOVER-RUNBOOK.md)** — historical cutover runbook (executed 2026-04-15).

### Migrated 2026-04-15 — Cloudflare Pages → Workers (tag: `v2.0.0-workers`)
- Live at https://beautyfacelift.mediapaulo.workers.dev (CI auto-deploys on push to master).
- All API routes unified under `worker/index.ts` with `itty-router`.
- Build output unchanged (24 static HTML pages in `dist/`).
- Pages project deleted at cutover. Rollback via Worker version history (dashboard → Deployments → Rollback) or `git revert` + push.
- Legacy Pages Functions removed from repo; originals preserved in git history at commit `394942f`.
- Fixed during cutover: booking RLS bug (service_role key was an anon JWT on Pages; replaced with real `sb_secret_*` key — bookings had been broken on Pages all along).
- See `docs/MIGRATION.md` for full context, env-var mapping, and rollback steps.

## Prior Status (March 18, 2026 — after SEO/AIO overhaul)

### Working
- All 24 static pages live on Cloudflare CDN (was 16)
- 5 blog articles (2000+ words each) with Article + FAQPage schema
- 60+ FAQ items sitewide with FAQPage JSON-LD
- All 4 treatment pages expanded to 3000+ words (pricing, process, FAQs, testimonials)
- Rich Schema.org: AggregateRating (4.8/5), AggregateOffer, Review, Person, Article
- AI discoverability: llms.txt + llms-full.txt + robots.txt (10 AI crawlers allowed)
- Sitemap: priority-weighted, admin/LP/confirmation filtered
- Geo meta tags (CH-ZH), max-image-preview:large, OG dimensions
- Booking flow: treatment → date → time → details → submit (writes to Supabase)
- **Email notifications (Resend)** — Supabase Edge Function `notify-booking` fires on booking INSERT/UPDATE via Database Webhook. Sends owner notification + customer confirmation. Currently in **sandbox mode** (`EMAIL_FROM=onboarding@resend.dev` default); customer emails only deliver when sender domain is verified in Resend. To switch to real sending: verify `beautyfacelift.ch` in Resend DNS + set `EMAIL_FROM=noreply@beautyfacelift.ch` in Supabase Edge Function secrets.
- Admin dashboard: login, bookings, services, availability, blocked dates, CSV export
- Mobile hamburger menu with full-screen overlay
- GSAP animations with prefers-reduced-motion support
- UTM parameter persistence, server-side tracking, conversion tracking

### Not Yet Configured (needs accounts/env vars)
- Custom domain beautyfacelift.ch (Cloudflare DNS) — HIGHEST PRIORITY
- Google Search Console — verify + submit sitemap
- Google Business Profile — claim and verify
- Stripe deposits (needs STRIPE_SECRET_KEY, PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- Email in production mode: verify `beautyfacelift.ch` sender domain in Resend (currently sandbox — see "Working" section)
- GTM (needs PUBLIC_GTM_ID)
- GA4 (needs GA4_MEASUREMENT_ID, GA4_API_SECRET)
- Meta Pixel (needs META_PIXEL_ID, META_ACCESS_TOKEN)

### Known Issues
- Admin test credentials are weak (info@pauloferreira.de / test123) — change before production
- Stripe deposit step in BookingWidget exists but isn't wired into the main flow yet
- Placeholder images need to be replaced with real Teresa/studio photos

## Commands

```bash
npm run dev        # Astro dev server (UI work, hot reload, port 4321)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run cf:dev     # Wrangler dev (full prod stack: Worker + ASSETS, port 8787)
npm run cf:deploy  # Build + deploy to Workers from local
npm run cf:tail    # Stream production logs
```

## Deployment

Auto-deploys on every `git push` to `master` branch via GitHub Actions (`.github/workflows/deploy.yml`).
Cloudflare dashboard: dash.cloudflare.com → Workers & Pages → beautyfacelift (Worker)

## Conventions

- All content in German (de_CH locale)
- File-based routing: `src/pages/[slug]/index.astro` → `/[slug]/`
- CSS class naming: `.component-name` (kebab-case, BEM-lite)
- React components: PascalCase filenames, default exports
- API functions: `functions/api/[name].ts` using Cloudflare Pages Functions format
- Inline styles avoided — use CSS classes from the design system
- No Tailwind, no CSS-in-JS, no CSS modules
