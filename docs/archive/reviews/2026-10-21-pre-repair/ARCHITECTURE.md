# Architecture — beautyfacelift-zuerich.ch

## Overview

```
[Browser] → [Cloudflare CDN] → Static HTML/CSS/JS (pre-rendered pages)
                              → /api/contact → Cloudflare Worker → Resend (enquiry email)
                              → /api/track   → Cloudflare Worker → Meta Conversions API
                              → legacy /api/services|slots|availability|bookings → Supabase (unreachable since 2026-10-06)
```

All pages are static HTML served by Cloudflare Workers Static Assets. API routes run in the same Cloudflare Worker (`worker/index.ts`) through `itty-router`. Bookings run on Treatwell. The legacy first-party booking system (Supabase Postgres, EU Frankfurt) is disabled. Its project has been unreachable since 2026-10-06, and removing it is recommended (see TODO).

## Why This Architecture

- **Astro static** over SSR: Pages ship zero JS by default. Only the legacy admin page loads React; public pages ship no framework JavaScript. Treatment pages = pure HTML. Faster LCP = lower Google Ads CPC.
- **Cloudflare** over Vercel: Unlimited bandwidth (no surprise bills from ad traffic), 100K requests/day free, 330+ edge cities, 0ms cold starts.
- **Supabase** (legacy): chosen for the first-party booking flow (Postgres, auth, edge functions). The public site has not used it since bookings moved to Treatwell.
- **React islands** over full SPA: JavaScript only loads where interaction is needed.
- **Vanilla CSS** over Tailwind: Client's existing design system, no framework overhead.

## Request Flow

### Static Pages (homepage, treatments, about, legal)
```
Browser → Cloudflare CDN (cached HTML) → served directly
```

### Booking And Ads Flow
```
1. User lands on homepage, treatment page, or noindex ad landing page.
2. Shared layout initializes PPC tracking, persists UTMs/click IDs, and emits page/view events.
3. Booking CTAs go to /termin/?service=... so attribution and treatment intent stay on the owned domain.
4. /termin/ emits TreatwellOutboundClick and forwards to https://buchung.treatwell.ch/ort/beauty-face-lift/.
5. Confirmed appointment completion happens on Treatwell, so the site measures booking intent, not confirmed bookings.
```

### Admin Dashboard (legacy; not working while Supabase is unreachable)
```
1. Browser loads /admin/ (static HTML + React island)
2. AdminDashboard mounts → checks Supabase auth session
3. If not logged in → show LoginForm → Supabase Auth signInWithPassword
4. If logged in → show tab interface → direct Supabase queries (RLS enforced)
```

### Conversion Tracking
```
Page/view/contact/booking intent events
  ├─ Client-side: dataLayer + optional Meta Pixel when PUBLIC_META_PIXEL_ID is configured
  └─ Server-side: POST /api/track → Meta CAPI + GA4 Measurement Protocol when secrets are configured

Primary launch proxy conversion:
  /termin/ redirect or direct Treatwell CTA → TreatwellOutboundClick / treatwell_outbound_click
```

## Database Schema

```
services ←── bookings (service_id FK)
availability (working hours per weekday)
blocked_dates (holidays, vacations)
settings (key-value config)
```

RLS policies:
- services/availability/blocked_dates: public SELECT, admin-only write
- bookings: public INSERT, admin-only SELECT/UPDATE/DELETE
- settings: public SELECT, admin-only write

## Component Architecture

### Astro Components (server-rendered, zero JS)
Visual rules and tokens: [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) ("Atelier Glow").

- **Layouts:**
  - `Base.astro` — master layout: meta tags, critical nav CSS, fonts, GSAP scroll animations, UTM persistence, consent-gated tracking.
  - `LandingPage.astro` — stripped layout for the Meta ad pages (no nav, no footer).
  - `BlogPost.astro` — "Wissen" article layout.
- **Navigation and footer:**
  - `Nav.astro` — floating pill nav: logo, centred text links (Behandlungen ▾, Über mich, Wissen, Kontakt) and a "Termin buchen" CTA.
    - The treatments panel and the mobile overlay are built from `SERVICE_GROUPS` (`shared/site.ts`).
  - `Footer.astro` — rounded cocoa panel with a wordmark, four columns (Studio, Kontakt, Behandlungen, Entdecken) and legal links with "Cookie-Einstellungen".
- **Page components:**
  - `Breadcrumbs.astro` — visual breadcrumbs plus schema.org BreadcrumbList.
  - `ServiceHubPage.astro` — template for the six service hubs (Gesichtsbehandlung, Laser-Haarentfernung, Waxing, Wimpern & Brauen, Make-up, Massage).
  - `src/components/treatment/*` — kit for the treatment detail pages:
    - `TreatmentHero`, `BenefitList`, `PriceMenu` (hairline price rows) and `TreatmentSteps`;
    - `FaqBlock` (also outputs the FAQ JSON-LD), `ReviewQuote` and `RelatedTreatments`;
    - `catalog.ts` holds the card data.
  - `BookingCta.astro` — shared booking panel with a WhatsApp button and an optional image.
  - `MarketingConsent.astro` — consent banner; it can be reopened from the footer.
  - `src/components/lp/*` — ad landing page sections (offer box, lead form, testimonials).

### React Islands (JS loaded on demand)
- BookingWidget — legacy first-party booking flow retained but not used as the public booking path while Treatwell is active
- `src/components/booking/**` is legacy first-party booking UI. It remains in the repo for a possible future direct-booking return, but it is not the active public conversion path while Treatwell is active.
- AdminDashboard — tab-based admin panel (client:load)

### Cloudflare Worker Routes
- /api/services — read from Supabase services table
- /api/availability — compute available dates from availability + blocked_dates
- /api/slots — compute time slots considering existing bookings + buffer
- /api/bookings — legacy first-party booking endpoint, disabled by default while Treatwell is active
- /api/track — forward events to Meta CAPI + GA4 Measurement Protocol
