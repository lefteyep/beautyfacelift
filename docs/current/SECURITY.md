# Security Status

Last updated: 2026-10-10

Production URL: https://beautyfacelift-zuerich.ch/

The former `beautyfacelift.mediapaulo.workers.dev` URL is no longer canonical and returned 404 in post-launch verification because `workers_dev=false` is active.

## Implemented in repo

- Booking API now validates service UUID, active service, date/time format, 90-day window, blocked dates, working hours, 30-minute slot alignment, overlap conflicts, duplicate submissions, and per-IP rate limits.
- Slot API now rejects malformed date/service parameters and only returns slots for active services inside the booking window.
- Contact API now fails closed for Turnstile on production hosts, returns controlled `503` responses for missing Resend configuration, preserves honeypot/rate limiting, and limits callback text length.
- Tracking API now allowlists events and source hosts, requires hashed email/phone user data, restricts Meta cookie fields, rate-limits requests, and keeps IP/user-agent server-controlled.
- Supabase migration `003_security_hardening.sql` adds `admin_users`, `is_admin()`, admin-only RLS policies, removes public booking inserts, and adds booking integrity/overlap constraints.
- Booking notification emails now escape booking fields before rendering HTML.
- Customer CSV export now quotes cells safely and prevents spreadsheet formula injection.
- Worker responses now include baseline security headers.

## Headers and Content Security Policy

- Every Worker response carries `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` and `Strict-Transport-Security: max-age=31536000` (`withSecurityHeaders` in `worker/index.ts`).
- HSTS has no `includeSubDomains` on purpose: other subdomains of the domain (mail records, future tools) are not all known to serve HTTPS, and a browser keeps the rule for a year.
- The CSP is report-only (`CSP_REPORT_ONLY`). On 2026-10-10, 9 live pages were loaded with marketing consent (GTM, GA4, Meta Pixel, Turnstile, map) and showed no violation; measurement hits were blocked during the test.
- It stays report-only for now: every new GTM tag (for example Google Ads) needs its hosts added first, or the enforced policy would block it without notice.

## Security smoke

`npm run smoke:security` (and the manual "Security smoke" GitHub workflow) checks the live headers and that the APIs reject bad input. Its default target is `https://beautyfacelift-zuerich.ch`.

- It sends requests to `/api/contact` and `/api/track` that must be rejected (no Turnstile token, unknown event, raw personal data). Nothing is delivered.
- While the Supabase backend of the legacy booking system is offline, the `/api/services` checks print SKIP and only check the security headers. The Supabase anon check prints SKIP when the project host does not resolve.

## Manual production actions still required

Steps 1–4 apply only while the legacy booking system is kept (the decision on 2026-10-10 was to keep it for now). If it is removed later, delete the Supabase secrets and the Supabase project instead.

1. Rotate the Supabase `service_role` key, then update Cloudflare:
   ```powershell
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name beautyfacelift
   ```
2. Replace weak/test Supabase Auth admin credentials with a strong unique password and enable MFA where available.
3. Apply `supabase/migrations/003_security_hardening.sql` to production, then seed the owner account:
   ```sql
   INSERT INTO public.admin_users (user_id, note)
   VALUES ('<owner auth.users.id>', 'Teresa / owner')
   ON CONFLICT (user_id) DO UPDATE SET note = EXCLUDED.note;
   ```
4. Disable public Supabase Auth signups in the Supabase dashboard.
5. Done: the production contact secrets are configured (checked in the Cloudflare dashboard on 2026-10-09):
   ```powershell
   npx wrangler secret put TURNSTILE_SECRET_KEY --name beautyfacelift
   npx wrangler secret put RESEND_API_KEY --name beautyfacelift
   npx wrangler secret put CONTACT_FROM_EMAIL --name beautyfacelift
   npx wrangler secret put CONTACT_TO_EMAIL --name beautyfacelift
   ```
   `CONTACT_BCC_EMAIL` (the agency's blind copy) was added as a dashboard Secret on 2026-10-10.
6. Done: `PUBLIC_TURNSTILE_SITE_KEY` is a GitHub Actions repository variable.
7. Stripe deposits were never enabled and are dropped, because Treatwell handles payment.
