# Architecture — beautyfacelift.ch

## Overview

```
[Browser] → [Cloudflare CDN] → Static HTML/CSS/JS (16 pre-rendered pages)
                              → /api/* → Cloudflare Pages Functions → Supabase (Postgres)
```

All pages are static HTML served from Cloudflare's edge CDN (330+ locations). API routes run as Cloudflare Pages Functions (V8 isolates, 0ms cold start). Database is Supabase Postgres in EU Frankfurt.

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

### Booking Flow
```
1. Browser loads /termin/ (static HTML + React island)
2. BookingWidget mounts → fetches /api/services (Cloudflare Function → Supabase)
3. User selects treatment → fetches /api/availability?month=...
4. User selects date → fetches /api/slots?date=...&service_id=...
5. User fills form → POST /api/bookings (Cloudflare Function → Supabase INSERT)
6. Redirect to /buchung-bestaetigt/?id=... (fires conversion tracking)
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
Booking complete → /buchung-bestaetigt/
  ├─ Client-side: dataLayer.push({ event: 'booking_complete', event_id }) → GTM → GA4 + Ads + Pixel
  └─ Server-side: POST /api/track { event_id } → Meta CAPI + GA4 Measurement Protocol
Both use same event_id for deduplication.
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
- BookingWidget — 5-step booking flow (client:visible or client:load)
- AdminDashboard — tab-based admin panel (client:load)

### Cloudflare Pages Functions
- /api/services — read from Supabase services table
- /api/availability — compute available dates from availability + blocked_dates
- /api/slots — compute time slots considering existing bookings + buffer
- /api/bookings — create booking with conflict detection
- /api/track — forward events to Meta CAPI + GA4 Measurement Protocol
