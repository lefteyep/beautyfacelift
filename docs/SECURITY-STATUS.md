# Security Status

Last updated: 2026-05-05

Production URL reviewed: https://beautyfacelift.mediapaulo.workers.dev/

## Implemented and verified

- Booking API validates service UUIDs, active services, date/time format, 90-day window, blocked dates, working hours, 30-minute slot alignment, overlap conflicts, duplicate submissions, and per-IP rate limits.
- Supabase production has `admin_users`, private admin helper enforcement, restricted admin RLS policies, no public booking inserts, booking length/status/time checks, and an overlap exclusion constraint for active bookings.
- Slot API rejects malformed date/service parameters and only returns slots for active services inside the booking window.
- Contact page builds with Turnstile enabled; the production contact API fails closed without a valid Turnstile token and uses controlled error responses.
- Worker secrets are configured for Supabase, Turnstile, Resend, and contact routing.
- Tracking API allowlists events and source hosts, requires hashed email/phone values, restricts Meta cookie fields, rate-limits requests, and keeps IP/user-agent server-controlled.
- Supabase `notify-booking` edge function is deployed with escaped booking fields in HTML emails.
- Customer CSV export quotes cells safely and prevents spreadsheet formula injection.
- Worker responses include baseline security headers and `/admin/` receives `no-store` plus `X-Robots-Tag: noindex, nofollow`.
- `npm audit --audit-level=moderate` is part of deployment CI and currently passes.

## Repeatable verification

Run the live security smoke checks after deploys or secret/config changes:

```powershell
npm run smoke:security -- --base-url https://beautyfacelift.mediapaulo.workers.dev
```

The smoke script verifies booking-adjacent APIs, contact Turnstile enforcement, tracking validation, admin noindex behavior, and baseline security headers. If `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are available, it also checks that the anon key cannot enumerate bookings.

## Still required before real launch

1. Revoke and recreate any credentials pasted into chat or logs, including temporary Cloudflare and Resend tokens.
2. Rotate the Supabase `service_role` key again before collecting real customer data, then update Cloudflare with the new secret.
3. Replace the current Supabase Auth admin password with a strong unique password and enable MFA where available.
4. Fix Supabase Auth site URL and redirect URLs so password recovery points to `https://beautyfacelift.mediapaulo.workers.dev` or the future custom domain instead of localhost.
5. Disable public Supabase Auth signups if not already disabled.
6. Enable Supabase leaked-password protection.
7. Connect `beautyfacelift.ch` to Cloudflare DNS, verify the domain in Resend, and switch sender addresses away from `onboarding@resend.dev`.
8. Keep Stripe deposits disabled until checkout creation, webhook verification, booking state transitions, and refund handling are complete.
