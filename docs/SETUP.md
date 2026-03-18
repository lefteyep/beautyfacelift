# Setup Guide — beautyfacelift.ch

## Prerequisites

- Node.js 22+ (LTS)
- npm
- GitHub account (lefteyep)
- Cloudflare account (Mediapaulo@gmail.com)
- Supabase account

## Local Development

```bash
cd astro-v2
npm install
npm run dev        # http://localhost:4321
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:
```bash
cp .env.example .env.local
```

## Cloudflare Pages Deployment

Auto-deploys on `git push` to `master`.

**Build settings:**
- Framework: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22 (set via NODE_VERSION env var)

**Dashboard:** dash.cloudflare.com → Workers und Pages → beautyfacelift

## Supabase Setup

1. Project URL: https://izekwngqjllaqibrwotp.supabase.co
2. Region: EU West (Frankfurt)
3. Schema: Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
4. Admin user: Create in Authentication → Users → Add user (auto-confirm)

## Connect Custom Domain

1. Cloudflare → beautyfacelift → Benutzerdefinierte Domänen
2. Add `beautyfacelift.ch`
3. Update DNS nameservers to Cloudflare (if not already)
4. SSL: Full (strict) — automatic

## Activate Email Notifications

1. Create account at resend.com
2. Add domain `beautyfacelift.ch` and verify DNS
3. Get API key from Resend dashboard
4. Add `RESEND_API_KEY` to Cloudflare env vars
5. Deploy Supabase Edge Function:
   ```bash
   supabase functions deploy notify-booking
   ```
6. Set up database webhook: Supabase → Database → Webhooks → INSERT on `bookings` → call notify-booking

## Activate Stripe Deposits

1. Create Stripe account at stripe.com
2. Get keys from Stripe Dashboard → Developers → API keys
3. Add to Cloudflare env vars:
   - `PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
   - `STRIPE_SECRET_KEY` (sk_live_...) — encrypt
   - `STRIPE_WEBHOOK_SECRET` (whsec_...) — encrypt
4. Set up Stripe webhook: stripe.com → Developers → Webhooks → Add endpoint
   - URL: `https://beautyfacelift.ch/api/stripe-webhook`
   - Events: `payment_intent.succeeded`, `charge.refunded`

## Activate Tracking

### Google Tag Manager
1. Create container at tagmanager.google.com
2. Add `PUBLIC_GTM_ID` (GTM-XXXXXXX) to Cloudflare env vars
3. Configure tags in GTM: GA4, Google Ads, Meta Pixel

### Google Analytics 4
1. Create property at analytics.google.com
2. Get Measurement ID and API Secret (Admin → Data Streams → Measurement Protocol)
3. Add `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` to Cloudflare env vars

### Meta Pixel
1. Create Pixel in Meta Business Suite → Events Manager
2. Get Pixel ID and generate access token (Events Manager → Settings → Conversions API)
3. Add `META_PIXEL_ID` and `META_ACCESS_TOKEN` to Cloudflare env vars
