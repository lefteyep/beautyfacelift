# Beauty Face Lift — Product Requirements Document

## 1. Project Overview

**Client:** Beauty Face Lift — Premium Medical Spa, Bahnhofstrasse 94, 8001 Zürich, Switzerland
**Owner:** Teresa Stimac
**Domain:** beautyfacelift.ch
**Phone:** +41 79 214 34 62
**Email:** info@beautyfacelift.ch
**Instagram:** @beautyfacelift.zh
**Current Booking:** https://buchung.treatwell.ch/ort/beauty-face-lift/

### Business Goal
Build a high-performance, SEO-optimized website with a custom booking system to replace Treatwell (which takes 30-35% commission per booking). The site must maximize ad performance (Google Ads, Meta Ads) through proper conversion tracking, server-side APIs, and perfect Core Web Vitals scores.

### Core Principles
- **$0/month hosting** — use free tiers of Cloudflare, Supabase, and Stripe
- **Maximum performance** — Lighthouse 95-100 across all metrics
- **Full conversion tracking** — client-side + server-side for Google & Meta
- **Business owner autonomy** — Teresa manages bookings, services, and availability herself
- **Own the data** — customer emails, phones, booking history for retargeting and CRM

---

## 2. Technical Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | **Astro 6** (static-first, islands architecture) | Free |
| Hosting | **Cloudflare Pages** (unlimited bandwidth, 330+ edge cities) | Free |
| Serverless API | **Cloudflare Workers** (100K req/day, 0ms cold starts) | Free |
| Database + Auth | **Supabase** (Postgres, Auth, Realtime, Edge Functions) | Free (500MB DB, 50K MAU) |
| Payments | **Stripe** (optional deposit collection) | 2.9% + CHF 0.30 per transaction |
| Tracking (client) | **GTM + Partytown** (non-blocking, runs in web worker) | Free |
| Tracking (server) | **Cloudflare Workers** → Meta CAPI + GA4 Measurement Protocol | Free |
| Interactive UI | **React islands** (loaded only where needed, zero JS elsewhere) | Free |
| Notifications | **Supabase Edge Functions** → WhatsApp Business API + Email (Resend) | Free tier |
| CSS | Vanilla CSS (already written, no Tailwind) | Free |
| Animations | GSAP + ScrollTrigger (CDN) | Free |

### Why This Stack
- **Astro over Next.js:** Pages ship zero JavaScript by default. Only booking widget and admin dashboard load React. Treatment pages, homepage = pure static HTML. Faster LCP = lower Google Ads CPC.
- **Cloudflare over Vercel:** Unlimited bandwidth (no surprise bills from ad traffic), 100K requests/day (vs Vercel's 100K/month), 330+ edge cities, 0ms cold starts on Workers.
- **Supabase over custom backend:** Free Postgres database, built-in auth, real-time subscriptions, edge functions for notifications. 500MB = tens of thousands of bookings.
- **React islands over full React:** JavaScript only loads where interaction is needed (booking form, admin panel). All other pages are 0KB JS.

---

## 3. What's Already Built

The Astro project exists at: `c:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2\`

### Project Structure (Current State)
```
astro-v2/
├── astro.config.mjs                    # Site config: site URL, sitemap integration, CSS minify
├── package.json                        # Astro 6, @astrojs/sitemap, astro-seo
├── public/
│   ├── assets/
│   │   ├── beautyfacelift-zurich-kosmetikstudio-logo.png
│   │   ├── spa_facial_treatment.png
│   │   ├── spa_interior.png
│   │   └── spa_products.png
│   └── robots.txt                      # Allow all + sitemap-index.xml reference
├── src/
│   ├── assets/                         # Duplicate of public/assets (for Astro image optimization later)
│   ├── components/
│   │   ├── Nav.astro                   # Props: variant ('default'|'treatment')
│   │   ├── Footer.astro                # Footer grid + mobile sticky CTA + dynamic year
│   │   ├── Marquee.astro               # Props: items (string[]) — infinite scroll marquee
│   │   └── TreatmentLinkCard.astro     # Props: href, title, description — cross-nav card
│   ├── layouts/
│   │   └── Base.astro                  # Props: title, description, canonical, preloadImage,
│   │                                   #   navVariant, structuredData
│   │                                   # Includes: charset, viewport, OG tags, canonical,
│   │                                   #   Google Fonts preconnect, LCP preload,
│   │                                   #   structured data JSON-LD, GSAP scripts,
│   │                                   #   Nav component, Footer component, all animations
│   ├── pages/
│   │   ├── index.astro                 # Homepage: hero, marquee, services section, about section
│   │   └── behandlungen/
│   │       ├── hydrafacial-zuerich/index.astro     # Treatment page + FAQ schema
│   │       ├── microneedling-zuerich/index.astro   # Treatment page + FAQ schema
│   │       └── fruchtsaeure-peeling-zuerich/index.astro  # Treatment page + FAQ schema
│   └── styles/
│       ├── main.css                    # Design tokens, typography, layout utils, buttons,
│       │                               #   text-reveal helpers, GPU acceleration
│       └── components.css              # Nav, hero, marquee, services, treatment hero,
│                                       #   highlights grid, FAQ, more-treatments, footer,
│                                       #   responsive (900px breakpoint), mobile sticky CTA
└── dist/                               # Built output: 4 HTML pages, sitemap-index.xml, sitemap-0.xml
```

### What's Working
- ✅ 4 pages migrated from static HTML to Astro components
- ✅ Shared layout (Nav, Footer written once, used on all pages)
- ✅ Schema.org JSON-LD structured data per page
  - Homepage: `HealthAndBeautyBusiness` (name, address, geo, phone, priceRange)
  - Treatment pages: `Service` (name, provider, description, areaServed)
  - Treatment pages: `FAQPage` (questions + answers)
- ✅ Auto-generated sitemap (`sitemap-index.xml` + `sitemap-0.xml`)
- ✅ Canonical URLs + Open Graph meta tags (title, description, url, type, locale de_CH)
- ✅ GSAP animations: text reveal, hero parallax/scale, image parallax, scroll fade-up, footer reveal
- ✅ Responsive design: mobile sticky CTA, grid collapse at 900px, nav links hidden on mobile
- ✅ CSS minification in production build
- ✅ robots.txt with sitemap reference
- ✅ Clean build: 4 pages in 2.24s, 0 errors, 0 warnings

### Current Dependencies (package.json)
```json
{
  "dependencies": {
    "@astrojs/sitemap": "^3.7.1",
    "astro": "^6.0.5",
    "astro-seo": "^1.1.0"
  }
}
```

---

## 4. Design System Reference

### Colors (CSS custom properties in `src/styles/main.css`)
```css
--bg-primary: #EDEBE6       /* stone/bone — main background */
--bg-secondary: #F7F6F2     /* lighter — marquee, cards */
--bg-dark: #121212           /* footer, dark sections */
--text-primary: #121212      /* headings, body on light bg */
--text-secondary: #5C5A55    /* paragraphs, muted text */
--text-inverse: #EDEBE6      /* text on dark backgrounds */
--accent: #CFA65E            /* brand gold — CTAs, accents */
--accent-light: #E8D09E      /* gradient start */
--accent-dark: #A9803C       /* gradient end */
--gold-gradient: linear-gradient(135deg, #E8D09E 0%, #CFA65E 40%, #A9803C 100%)
```

### Typography
- **Serif:** `Cormorant Garamond` — headings, display text, hero titles
- **Sans:** `Outfit` — body text, UI, buttons, navigation
- Loaded via Google Fonts with `preconnect`
- Display text: `clamp(4rem, 12vw, 14rem)` — massive editorial headlines

### Key CSS Classes
- `.pill-btn` — gold gradient CTA button with hover lift effect
- `.pill-btn-outline` — outline variant, fills on hover
- `.service-card` — treatment card with image mask + parallax
- `.highlight-item` — numbered benefit card (01, 02, 03)
- `.faq-item` — FAQ entry (currently static, no accordion toggle)
- `.treatment-link-card` — cross-navigation card with arrow
- `.service-image-mask` — overflow-hidden container for parallax images
- `.text-reveal` / `.text-reveal-wrapper` — GSAP text reveal animation targets
- `.scroll-anim` — GSAP scroll-triggered fade-up animation target
- `.mobile-sticky-cta` — fixed bottom CTA, visible only below 900px

### Responsive
- Single breakpoint: `@media (max-width: 900px)`
- Nav links hide, grids collapse to 1 column, treatment hero shrinks to 55vh

---

## 5. What Needs to Be Built

### Phase 1: Deployment & Infrastructure
**Goal:** Get the current site live on Cloudflare Pages.

**Steps:**
1. Initialize git repository in `astro-v2/`
2. Create GitHub repository and push
3. Create Cloudflare Pages project:
   - Build command: `npm run build`
   - Output directory: `dist/`
   - Node.js version: 22+
4. Configure custom domain: `beautyfacelift.ch`
   - Update DNS nameservers to Cloudflare
   - SSL: Full (strict)
5. Install Cloudflare adapter for hybrid mode:
   ```bash
   npm install @astrojs/cloudflare
   ```
6. Update `astro.config.mjs`:
   ```js
   import cloudflare from '@astrojs/cloudflare';
   export default defineConfig({
     output: 'hybrid',           // static by default, server where needed
     adapter: cloudflare(),
     site: 'https://beautyfacelift.ch',
     integrations: [sitemap()],
   });
   ```
   All existing pages remain static. Only `/api/*` routes run on Workers.

**Result:** beautyfacelift.ch is live with the current 4 pages.

---

### Phase 2: Tracking & Analytics
**Goal:** Full client-side + server-side tracking for Google Ads & Meta Ads.

#### 2a. Client-Side Tracking (via Partytown)
1. Install: `npm install @astrojs/partytown` (verify Astro 6 compatibility)
2. Add to `astro.config.mjs` integrations
3. Add GTM snippet to `src/layouts/Base.astro` with `type="text/partytown"`:
   ```html
   <!-- GTM via Partytown (runs in web worker, non-blocking) -->
   <script type="text/partytown">
     (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
     new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
     j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
     'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
     })(window,document,'script','dataLayer','GTM-XXXXXXX');
   </script>
   ```
4. GTM Container setup (done in GTM web UI):
   - GA4 Configuration tag (Measurement ID)
   - Google Ads Conversion Tracking tag
   - Google Ads Remarketing tag
   - Meta Pixel base code tag
   - Enhanced Conversions tag (Google)
   - DataLayer variable for conversion events

#### 2b. Server-Side Tracking (Cloudflare Worker endpoints)

**File: `src/pages/api/track.ts`**
```
POST /api/track
Body: {
  event_name: string,       // e.g. "Lead", "Purchase", "ViewContent"
  event_data: {
    value?: number,
    currency?: string,
    content_name?: string,
    content_category?: string
  },
  user_data: {
    email?: string,         // hashed
    phone?: string,         // hashed
    client_ip?: string,
    user_agent?: string,
    fbc?: string,           // Meta click ID (from _fbc cookie)
    fbp?: string            // Meta browser ID (from _fbp cookie)
  },
  event_source_url: string
}
```

This endpoint:
1. Forwards to **Meta Conversions API**: `POST https://graph.facebook.com/v19.0/{PIXEL_ID}/events`
2. Forwards to **GA4 Measurement Protocol**: `POST https://www.google-analytics.com/mp/collect`

#### 2c. Thank You / Conversion Page

**File: `src/pages/buchung-bestaetigt/index.astro`**
- Fires Google Ads conversion via GTM `dataLayer.push({ event: 'booking_complete', ... })`
- Fires Meta Lead/Purchase event (client-side Pixel + server-side CAPI call)
- Fires GA4 `generate_lead` event
- Shows booking confirmation (treatment, date, time, customer name)
- Links back to homepage

**Result:** Full tracking stack — client + server-side — for both Google and Meta.

---

### Phase 3: Booking System Backend
**Goal:** Supabase-powered booking backend with full API.

#### 3a. Supabase Project Setup
- Create project at supabase.com (free tier)
- Region: EU West (Frankfurt) — closest to Zürich

#### 3b. Database Schema

```sql
-- Services (treatments)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- e.g. "Hydrafacial Signature"
  slug TEXT UNIQUE NOT NULL,             -- e.g. "hydrafacial-signature"
  description TEXT,
  duration_minutes INT NOT NULL,         -- e.g. 60
  price_chf DECIMAL(10,2) NOT NULL,     -- e.g. 250.00
  deposit_chf DECIMAL(10,2) DEFAULT 0,  -- optional deposit amount (0 = no deposit)
  category TEXT,                         -- e.g. "Hydrafacial", "Microneedling", "Peeling"
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Availability (Teresa's working hours per day of week)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL,              -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,              -- e.g. 09:00
  end_time TIME NOT NULL,                -- e.g. 18:00
  is_active BOOLEAN DEFAULT true
);

-- Blocked dates (holidays, vacations, sick days)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  end_time TIME NOT NULL,                -- calculated: booking_time + service duration
  status TEXT DEFAULT 'pending',         -- pending | confirmed | cancelled | completed
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  stripe_payment_id TEXT,                -- Stripe PaymentIntent ID (if deposit paid)
  notes TEXT,                            -- customer notes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_services_active ON services(is_active);
```

#### 3c. Row Level Security (RLS)

```sql
-- Services: public can read active, only admin can write
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Availability: public can read active, only admin can write
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active availability" ON availability FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to availability" ON availability FOR ALL USING (auth.role() = 'authenticated');

-- Blocked dates: public can read, only admin can write
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blocked dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Admin full access to blocked dates" ON blocked_dates FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: public can insert, only admin can read/update/delete
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
```

#### 3d. API Endpoints

**`GET /api/services`** — List active services
- Returns: `{ services: [{ id, name, slug, description, duration_minutes, price_chf, deposit_chf, category }] }`
- Sorted by sort_order

**`GET /api/availability?month=2026-04`** — Available dates for a given month
- Checks: availability table (working hours) + blocked_dates table
- Returns: `{ dates: ["2026-04-01", "2026-04-02", ...] }` (only dates with working hours and not blocked)

**`GET /api/slots?date=2026-04-15&service_id=xxx`** — Available time slots for a date + service
- Calculates: available hours from availability table, minus existing bookings that overlap
- Uses service duration to determine slot intervals (e.g. 60-min service = slots every 60 min)
- Returns: `{ slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] }`

**`POST /api/bookings`** — Create a new booking
- Body: `{ service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes? }`
- Validates: slot is still available (race condition check)
- Calculates: end_time from service duration
- Returns: `{ booking: { id, ... }, redirect: "/buchung-bestaetigt/?id=xxx" }`
- Triggers: Supabase database webhook → notification edge function

**`POST /api/create-deposit`** — Create Stripe PaymentIntent for optional deposit
- Body: `{ booking_id }`
- Looks up deposit_chf from the service
- Creates Stripe PaymentIntent
- Returns: `{ client_secret: "pi_xxx_secret_xxx" }`

**`POST /api/stripe-webhook`** — Handle Stripe webhook events
- Validates webhook signature
- On `payment_intent.succeeded`: updates booking `deposit_paid = true`
- On `charge.refunded`: updates booking if relevant

**Result:** Full booking API ready for the frontend.

---

### Phase 4: Booking Widget Frontend
**Goal:** React island component for customer-facing booking flow.

#### Install React integration
```bash
npx astro add react
```

#### BookingWidget Component
**File: `src/components/BookingWidget.tsx`**
- Loaded as Astro island: `<BookingWidget client:visible />`
- Only ships JavaScript when user scrolls to the booking section

**Step-by-step flow:**
1. **Select treatment** — grid of active services showing name, duration, price
2. **Select date** — calendar month view, disabled dates grayed out
3. **Select time** — available time slots as pill buttons
4. **Enter details** — form: name, email, phone (CH format), optional notes
5. **Optional deposit** — if service has deposit > 0, show Stripe payment form (can skip with "Ohne Anzahlung buchen")
6. **Confirm** — review summary, submit button
7. **Redirect** → `/buchung-bestaetigt/?id=xxx`

**Design:** Must use the existing design system:
- `.pill-btn` / `.pill-btn-outline` for buttons
- `var(--font-sans)` for UI text, `var(--font-serif)` for headings
- `var(--accent)` / `var(--gold-gradient)` for active states
- `var(--radius-card)` for rounded containers
- `var(--bg-primary)` / `var(--bg-secondary)` for backgrounds

#### Standalone Booking Page
**File: `src/pages/termin/index.astro`**
- Full-page booking experience
- Uses Base layout
- Embeds `<BookingWidget client:load />` (load immediately, not on scroll)

#### Embed on Treatment Pages
Add booking widget at the bottom of each treatment page, before "More Treatments":
```astro
<BookingWidget client:visible preselectedCategory="Hydrafacial" />
```
Pre-selects the relevant treatment category.

**Result:** Customers can book directly on the website, no Treatwell needed.

---

### Phase 5: Admin Dashboard
**Goal:** Teresa manages all bookings, services, and availability.

**File: `src/components/AdminDashboard.tsx`**
- Loaded as React island: `<AdminDashboard client:load />`

**File: `src/pages/admin/index.astro`**
- Uses Base layout with `navVariant="default"`
- Not indexed: add `<meta name="robots" content="noindex">` to head

#### Features

**1. Login**
- Supabase Auth: email + password
- Single admin user (Teresa)
- Session persists via Supabase cookie

**2. Booking Management (main view)**
- Calendar view: day/week toggle
- List of bookings per day: customer name, treatment, time, status
- Actions per booking: Confirm / Cancel / Mark Complete / Add Notes
- Status colors: pending (gold), confirmed (green), cancelled (red), completed (gray)

**3. Service Management**
- Table: name, category, duration, price, deposit, active toggle
- Add new service: form with all fields
- Edit existing service: inline or modal
- Reorder services (drag or sort_order input)
- Toggle active/inactive (soft delete)

**4. Availability Management**
- Week view: set start_time + end_time per day of week
- Toggle days on/off (e.g. Sunday = off)

**5. Blocked Dates**
- Calendar view: click dates to block/unblock
- Add reason (optional): "Ferien", "Feiertag", etc.

**6. Customer List**
- Table: name, email, phone, total bookings, last visit
- Export as CSV (for Meta Custom Audiences / Google Customer Match)

**Design:** Use the existing CSS variables. Keep it functional — this is an internal tool, not customer-facing. Clean table layouts, form inputs styled with the brand fonts.

**Result:** Teresa can manage everything herself with zero developer involvement.

---

### Phase 6: Stripe Integration (Optional Deposit)
**Goal:** Customers can optionally pay a deposit when booking.

**Setup:**
1. Create Stripe account for the business (stripe.com)
2. Install client library: `npm install @stripe/stripe-js`
3. Stripe server SDK is used directly in Workers via `fetch()` to Stripe API (no Node SDK needed)

**File: `src/components/StripeDeposit.tsx`**
- Stripe Elements (card input) embedded in BookingWidget step 5
- Uses `loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY)` from `@stripe/stripe-js`
- Shows deposit amount and "Jetzt Anzahlung bezahlen" button
- Alternative: "Ohne Anzahlung buchen" skip button

**Flow:**
1. BookingWidget calls `POST /api/create-deposit` with `booking_id`
2. Server creates `PaymentIntent` for `deposit_chf` amount in CHF
3. Returns `client_secret` to frontend
4. Frontend confirms payment via Stripe Elements
5. On success: redirect to thank you page
6. Stripe webhook updates `deposit_paid = true` on the booking

**Refund on cancellation:**
- When Teresa cancels a booking with `deposit_paid = true`
- Admin dashboard calls `POST /api/refund-deposit` with `booking_id`
- Server calls Stripe Refund API
- Updates booking record

**Result:** Optional deposit collection with full refund capability.

---

### Phase 7: Notifications
**Goal:** Instant notification to Teresa + confirmation to customer on every booking.

#### Supabase Edge Function: `notify-booking`
**File: `supabase/functions/notify-booking/index.ts`**

**Trigger:** Supabase database webhook on INSERT into `bookings` table.

**Sends 3 messages:**

1. **WhatsApp to Teresa** (via WhatsApp Business API or Twilio)
   ```
   🔔 Neue Buchung!

   Kundin: [Name]
   Behandlung: [Service Name]
   Datum: [Date] um [Time]
   Telefon: [Phone]

   → Admin öffnen: https://beautyfacelift.ch/admin/
   ```

2. **Email to Teresa** (via Resend — free: 3K emails/month)
   - Subject: "Neue Buchung: [Name] — [Service] am [Date]"
   - Full booking details in branded HTML template
   - Direct link to admin dashboard

3. **Confirmation Email to Customer** (via Resend)
   - Subject: "Ihre Buchung bei Beauty Face Lift — [Service]"
   - Booking summary: treatment, date, time, address
   - Spa address with Google Maps link
   - Preparation instructions (if applicable)
   - Calendar invite (.ics file) as attachment
   - Contact info for changes/cancellations

#### On Status Change
When Teresa confirms or cancels via admin dashboard:
- **Confirmed:** Email to customer: "Ihre Buchung wurde bestätigt"
- **Cancelled:** Email to customer: "Ihre Buchung wurde storniert" + Stripe refund if deposit paid

**Result:** Fully automated notification pipeline.

---

### Phase 8: Polish & SEO
**Goal:** Production-ready, fully optimized website.

1. **Image optimization:**
   - Convert PNGs in `src/assets/` to WebP/AVIF using Astro `<Image>` component
   - Replace raw `<img>` tags with `<Image>` where possible
   - Keep `public/assets/` for OG images and static references

2. **Favicon set:**
   - `favicon.ico` (32x32)
   - `favicon.svg` (scalable)
   - `apple-touch-icon.png` (180x180)

3. **Web manifest:** `public/manifest.json`
   ```json
   {
     "name": "Beauty Face Lift",
     "short_name": "BFL",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#EDEBE6",
     "theme_color": "#CFA65E"
   }
   ```

4. **Theme color:** Add `<meta name="theme-color" content="#CFA65E">` to Base.astro

5. **Lighthouse audit:** Target 95+ on all 4 metrics (Performance, Accessibility, Best Practices, SEO)

6. **Structured data validation:** Test all pages with Google Rich Results Test

7. **Search Console:** Add verification meta tag, submit sitemap

8. **Bing Webmaster:** Add verification meta tag

**Result:** Ship it.

---

## 6. Services (Initial Data for Supabase)

These treatments should be seeded into the `services` table. Teresa manages prices and additions via admin dashboard.

| name | slug | category | duration_minutes | Notes |
|---|---|---|---|---|
| Hydrafacial Signature | hydrafacial-signature | Hydrafacial | 60 | Core treatment |
| Hydrafacial Platinum | hydrafacial-platinum | Hydrafacial | 90 | Premium version |
| Microneedling Gesicht | microneedling-gesicht | Microneedling | 60 | Face only |
| Microneedling Gesicht + Hals | microneedling-gesicht-hals | Microneedling | 75 | Face + neck |
| Fruchtsäure Peeling | fruchtsaeure-peeling | Peeling | 45 | AHA treatment |
| ColdPlasma Behandlung | coldplasma | ColdPlasma | 60 | Plasma treatment |

*Prices and deposit amounts to be entered by Teresa via admin dashboard.*

---

## 7. Target File Structure (End State)

```
astro-v2/
├── astro.config.mjs                    # Cloudflare adapter, hybrid output, sitemap, partytown
├── package.json                        # Astro, React, Supabase, Stripe, Partytown
├── PRD.md                              # This file
├── wrangler.toml                       # Cloudflare Workers config (if needed beyond Pages)
├── public/
│   ├── assets/                         # Static images (logo, spa photos)
│   ├── robots.txt                      # Crawl rules + sitemap reference
│   ├── favicon.ico
│   ├── favicon.svg
│   └── manifest.json                   # PWA manifest
├── src/
│   ├── assets/                         # Source images (for Astro <Image> optimization)
│   ├── components/
│   │   ├── Nav.astro                   # ✅ Navigation (variant prop)
│   │   ├── Footer.astro                # ✅ Footer + mobile sticky CTA
│   │   ├── Marquee.astro               # ✅ Scrolling marquee (items[] prop)
│   │   ├── TreatmentLinkCard.astro     # ✅ Cross-nav card
│   │   ├── BookingWidget.tsx           # 🔨 React island — full booking flow
│   │   ├── AdminDashboard.tsx          # 🔨 React island — admin panel
│   │   └── StripeDeposit.tsx           # 🔨 React island — Stripe Elements
│   ├── layouts/
│   │   └── Base.astro                  # ✅ Base layout (needs: Partytown GTM, theme-color)
│   ├── lib/
│   │   ├── supabase.ts                 # 🔨 Supabase client initialization
│   │   └── stripe.ts                   # 🔨 Stripe client initialization
│   ├── pages/
│   │   ├── index.astro                 # ✅ Homepage
│   │   ├── termin/index.astro          # 🔨 Standalone booking page
│   │   ├── buchung-bestaetigt/index.astro  # 🔨 Thank you / conversion page
│   │   ├── admin/index.astro           # 🔨 Admin dashboard (noindex)
│   │   ├── api/
│   │   │   ├── services.ts             # 🔨 GET active services
│   │   │   ├── availability.ts         # 🔨 GET available dates for month
│   │   │   ├── slots.ts               # 🔨 GET time slots for date + service
│   │   │   ├── bookings.ts            # 🔨 POST create booking
│   │   │   ├── create-deposit.ts      # 🔨 POST Stripe PaymentIntent
│   │   │   ├── stripe-webhook.ts      # 🔨 POST Stripe webhook handler
│   │   │   ├── refund-deposit.ts      # 🔨 POST refund deposit on cancel
│   │   │   └── track.ts              # 🔨 POST server-side tracking (Meta CAPI + GA4)
│   │   └── behandlungen/
│   │       ├── hydrafacial-zuerich/index.astro          # ✅ Treatment page
│   │       ├── microneedling-zuerich/index.astro        # ✅ Treatment page
│   │       └── fruchtsaeure-peeling-zuerich/index.astro # ✅ Treatment page
│   └── styles/
│       ├── main.css                    # ✅ Design tokens, typography, utilities
│       └── components.css              # ✅ All component styles
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql     # 🔨 Full database schema + RLS
    └── functions/
        └── notify-booking/index.ts    # 🔨 WhatsApp + Email notifications
```

Legend: ✅ = done, 🔨 = to build

---

## 8. Environment Variables

Set in Cloudflare Pages dashboard → Settings → Environment variables:

```env
# Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # server-side only, never expose

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...                  # server-side only
STRIPE_WEBHOOK_SECRET=whsec_...                # server-side only

# Tracking — Meta
META_PIXEL_ID=123456789
META_ACCESS_TOKEN=EAA...                       # from Meta Events Manager → CAPI

# Tracking — Google
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=xxxxxxxx                        # from GA4 Admin → Data Streams → API Secret

# Notifications
RESEND_API_KEY=re_...                          # from resend.com
WHATSAPP_API_TOKEN=...                         # WhatsApp Business API or Twilio
OWNER_PHONE=+41792143462
OWNER_EMAIL=info@beautyfacelift.ch

# GTM
PUBLIC_GTM_ID=GTM-XXXXXXX
```

---

## 9. External Accounts Needed

| Service | URL | Purpose | Free Tier |
|---|---|---|---|
| **Cloudflare** | dash.cloudflare.com | Hosting + Workers + DNS | Unlimited BW, 100K req/day |
| **Supabase** | supabase.com | Database + Auth + Edge Functions | 500MB DB, 50K MAU |
| **Stripe** | stripe.com | Optional deposit payments | Pay per transaction only |
| **GitHub** | github.com | Code repository + CI/CD | Unlimited private repos |
| **Google Tag Manager** | tagmanager.google.com | Client-side tag management | Free |
| **Google Analytics 4** | analytics.google.com | Website analytics | Free |
| **Google Ads** | ads.google.com | Search & display ads | Pay per click |
| **Google Search Console** | search.google.com/search-console | SEO monitoring + sitemap | Free |
| **Meta Business Suite** | business.facebook.com | Meta Pixel + Conversions API | Free |
| **Resend** | resend.com | Transactional emails | 3K emails/month free |
| **WhatsApp Business** | business.whatsapp.com | Booking notifications | 1K messages/month free |
| **Bing Webmaster** | bing.com/webmasters | Bing SEO | Free |

---

## 10. Conversion Tracking Architecture

```
Customer books on website
        │
        ├──► Client-side (via GTM + Partytown, non-blocking)
        │     ├── GA4: generate_lead event
        │     ├── Google Ads: conversion tag fires
        │     └── Meta Pixel: Lead event fires
        │
        └──► Server-side (via POST /api/track)
              ├── GA4 Measurement Protocol: generate_lead
              ├── Google Ads Enhanced Conversions: hashed email + phone
              └── Meta Conversions API: Lead event with user_data
                  (email_hash, phone_hash, fbc, fbp, client_ip, user_agent)
```

**Why both client + server?**
- Client-side can be blocked by ad blockers (30-40% of users)
- Server-side is 100% reliable, never blocked
- Meta and Google both deduplicate using event_id
- Running both maximizes reported conversions → better ad optimization → lower CPC

---

## 11. Monthly Cost Summary

| Service | Cost |
|---|---|
| Cloudflare Pages + Workers | $0 |
| Supabase (free tier) | $0 |
| Resend (free tier) | $0 |
| WhatsApp Business (free tier) | $0 |
| GitHub (free tier) | $0 |
| GTM / GA4 / Search Console | $0 |
| Stripe | 2.9% + CHF 0.30 per deposit (only when customers pay deposit) |
| **Total fixed cost** | **$0/month** |
