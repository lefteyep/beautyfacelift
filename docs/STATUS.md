# Project Status — Beauty Face Lift Astro/Worker

Last updated: 2026-05-10

## Deployment

| Environment | URL | Status |
| --- | --- | --- |
| Worker production/dev target | https://beautyfacelift.mediapaulo.workers.dev | Live |
| Custom domain | https://beautyfacelift.ch | Pending DNS access |
| GitHub | https://github.com/lefteyep/beautyfacelift | Active |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Active |

## Current state

- Astro app is served by Cloudflare Workers with static assets bound through `ASSETS`.
- `master` is the live deploy branch and deploys through GitHub Actions.
- Public booking CTAs currently send users to Treatwell: `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- First-party booking, slot, contact, and tracking APIs are hardened and retained, but the public booking path is external Treatwell for now.
- Admin access depends on Supabase Auth plus the `admin_users` allowlist enforced by RLS.
- `/api/services` returns the official Treatwell-aligned catalog with 65 active services.
- Contact Turnstile and Resend runtime secrets are configured for the Worker.
- Supabase `notify-booking` edge function is deployed with escaped HTML output.
- Dependency audit currently passes at `moderate` severity.
- Worker responses include HSTS and CSP report-only monitoring.

## Feature completion

| Feature | Status | Notes |
| --- | --- | --- |
| Public site | Live | Astro/Worker deployment |
| Public booking | Live via Treatwell | All public booking CTAs leave to Treatwell |
| Booking widget | Retained, not public | Legacy first-party flow kept in code while Treatwell is active |
| Booking API hardening | Live | Strict validation, duplicate checks, overlap handling |
| Admin dashboard | Live | RLS allowlist is the real access control |
| Contact form | Dev-ready | Turnstile required on production host; sender domain still temporary |
| Tracking endpoint | Live but analytics inactive | GA4/Meta secrets not configured yet; Meta Lead currently means Treatwell booking click, not confirmed appointment |
| Supabase migrations | Repaired | Production bookkeeping aligned |
| Edge booking emails | Live | Supabase function deployed |
| Stripe deposits | Disabled | Partial code only; do not enable yet |
| Custom domain | Pending | Requires `beautyfacelift.ch` DNS access |

## Runtime configuration

| Variable or secret | Location | Status |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | Worker/GitHub var | Set |
| `PUBLIC_SUPABASE_ANON_KEY` | Worker/GitHub secret | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker secret | Set, rotate again before launch |
| `PUBLIC_TURNSTILE_SITE_KEY` | GitHub var | Set |
| `TURNSTILE_SECRET_KEY` | Worker secret | Set |
| `RESEND_API_KEY` | Worker secret | Set, temporary/dev key |
| `CONTACT_FROM_EMAIL` | Worker secret | Set, temporary/dev sender |
| `CONTACT_TO_EMAIL` | Worker secret | Set |
| `PUBLIC_META_PIXEL_ID` | Worker/GitHub var | Not set |
| `GA4_MEASUREMENT_ID` / `GA4_API_SECRET` | Worker secrets | Not set |
| `META_PIXEL_ID` / `META_ACCESS_TOKEN` | Worker secrets | Not set |
| Stripe keys | Worker/build secrets | Not set |

## Verification

Use the smoke script after production changes:

```powershell
npm run smoke:security -- --base-url https://beautyfacelift.mediapaulo.workers.dev
```

Expected checks:

- Services API returns a non-empty catalog.
- Invalid slot parameters return `400`.
- Contact form rejects submissions without Turnstile on the production host.
- Tracking rejects invalid events and raw PII.
- Admin page stays `noindex` and `no-store`.
- Baseline security headers, including HSTS and CSP report-only, are present.

## Remaining launch work

- Connect `beautyfacelift.ch` DNS to Cloudflare and bind it to the Worker.
- Verify the real sender domain in Resend and update sender secrets.
- Revoke/recreate temporary pasted tokens and rotate Supabase secrets.
- Fix Supabase Auth password-recovery redirects away from localhost.
- Replace the admin password before real customer data is collected.
- Enable Supabase leaked-password protection.
- Keep Stripe deposits disabled until the payment flow is fully implemented and tested.
