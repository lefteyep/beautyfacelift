# Architecture — beautyfacelift.ch

## Overview

```
[Browser] → [Cloudflare CDN] → Static HTML/CSS/JS (16 pre-rendered pages)
                              → /api/* → Cloudflare Worker → Supabase (Postgres)
```

All public pages are static HTML served from Cloudflare's edge CDN. API routes run in the unified Cloudflare Worker. Database is Supabase Postgres in EU Frankfurt.

## Why This Architecture

- **Astro static** over SSR: Pages ship zero JS by default. Public treatment pages are pure HTML aside from shared enhancement scripts.
- **Cloudflare** over Vercel: Unlimited bandwidth (no surprise bills from ad traffic), 100K requests/day free, 330+ edge cities, 0ms cold starts.
- **Supabase** over custom backend: Free Postgres, built-in auth, real-time, edge functions. 500MB = tens of thousands of bookings.
- **React islands** over full SPA: JavaScript only loads where interaction is needed.
- **Vanilla CSS** over Tailwind: Client's existing design system, no framework overhead.

## Request Flow

### Static Pages (homepage, treatments, about, legal)
```
Browser → Cloudflare CDN (cached HTML) → served directly
```

### Public Booking Flow
```
1. User clicks any public booking CTA.
2. Shared click tracking emits a Meta/GA4 Lead event labelled "Treatwell booking click".
3. Browser navigates to https://buchung.treatwell.ch/ort/beauty-face-lift/
```

`/termin/` is retained only as a noindex fallback page that forwards users to Treatwell. It is excluded from the sitemap.

### Admin Dashboard
```
1. Browser loads /admin/ (static HTML + React island)
2. AdminDashboard mounts → checks Supabase auth session
3. If not logged in → show LoginForm → Supabase Auth signInWithPassword
4. If logged in → show tab interface → direct Supabase queries (RLS enforced)
```

### Conversion Tracking
```
Ad LP page load
  ├─ Client-side: fbq PageView when PUBLIC_META_PIXEL_ID is configured
  └─ Server-side: POST /api/track PageView → Meta CAPI + GA4 Measurement Protocol

Treatwell booking click
  ├─ Client-side: fbq Lead with content_name "Treatwell booking click"
  └─ Server-side: POST /api/track Lead with the same event_id for deduplication
```

Important Meta ads constraint: because the appointment is completed on Treatwell, this site currently measures booking intent, not confirmed Treatwell appointment completion. Confirmed appointment conversion tracking requires a Treatwell-supported pixel/callback flow or a later offline/CRM conversion import.

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
- BookingWidget — legacy first-party booking flow retained in code but not embedded on public booking pages while Treatwell is the active booking destination
- AdminDashboard — tab-based admin panel (client:load)

### Cloudflare Pages Functions
- /api/services — read from Supabase services table
- /api/availability — compute available dates from availability + blocked_dates
- /api/slots — compute time slots considering existing bookings + buffer
- /api/bookings — create booking with conflict detection
- /api/track — forward events to Meta CAPI + GA4 Measurement Protocol
