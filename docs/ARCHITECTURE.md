# Architecture — beautyfacelift-zuerich.ch

## Overview

```
[Browser] → [Cloudflare CDN] → Static HTML/CSS/JS (pre-rendered pages)
                              → /api/* → Cloudflare Worker routes → Supabase (Postgres)
```

All pages are static HTML served by Cloudflare Workers Static Assets. API routes run in the same Cloudflare Worker (`worker/index.ts`) through `itty-router`. Database is Supabase Postgres in EU Frankfurt.

## Why This Architecture

- **Astro static** over SSR: Pages ship zero JS by default. Only booking widget and admin load React. Treatment pages = pure HTML. Faster LCP = lower Google Ads CPC.
- **Cloudflare** over Vercel: Unlimited bandwidth (no surprise bills from ad traffic), 100K requests/day free, 330+ edge cities, 0ms cold starts.
- **Supabase** over custom backend: Free Postgres, built-in auth, real-time, edge functions. 500MB = tens of thousands of bookings.
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

### Admin Dashboard
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
- Base.astro — master layout with all meta tags, fonts, GSAP, UTM, GTM
- LandingPage.astro — stripped layout for ad pages (no nav, no footer)
- Nav.astro — fixed nav + mobile hamburger overlay
- Footer.astro — 3-col grid + legal links + mobile sticky CTA
- Marquee.astro — infinite scroll (CSS animation)
- Breadcrumbs.astro — visual + schema.org BreadcrumbList
- TreatmentLinkCard.astro — cross-navigation card

### React Islands (JS loaded on demand)
- BookingWidget — legacy first-party booking flow retained but not used as the public booking path while Treatwell is active
- AdminDashboard — tab-based admin panel (client:load)

### Cloudflare Worker Routes
- /api/services — read from Supabase services table
- /api/availability — compute available dates from availability + blocked_dates
- /api/slots — compute time slots considering existing bookings + buffer
- /api/bookings — legacy first-party booking endpoint, disabled by default while Treatwell is active
- /api/track — forward events to Meta CAPI + GA4 Measurement Protocol
