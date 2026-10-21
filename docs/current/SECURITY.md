# Security Status

Last updated: 2026-10-21

Production URL: https://beautyfacelift-zuerich.ch/

The former `beautyfacelift.mediapaulo.workers.dev` URL is no longer canonical and returned 404 in post-launch verification because `workers_dev=false` is active.

## Review repair status

**IMPLEMENTATION IN PROGRESS:** [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) tracks R1–R11 and pending combined verification. Existing code/historical passing checks are not evidence that these fixes are verified or live. The public production source reviewed is `35af1f0`; cockpit #55–#57 are unmerged. No authentication provider is selected/activated by this repair, customer emails stay off and reminders agency-only. Disclosure, retention/deletion, failure alerting and reconciliation are pre-D1 rollout gates.

## Existing code and its limits

- Legacy booking validation code exists, but booking writes are disabled by default and Treatwell is the current booking system. Supabase was reported unreachable since 2026-10-06; this is not a working production booking/admin service.
- Slot API now rejects malformed date/service parameters and only returns slots for active services inside the booking window.
- The contact page requires Turnstile on production hosts; the existing Aquafacial/combo ad campaigns are explicitly exempt and retain honeypot/per-IP controls. Missing required Turnstile/Resend configuration gets controlled errors. In-memory rate limiting is not a durable/global abuse guarantee.
- Tracking code allowlists events and declared source hosts, requires hashed email/phone user data and keeps IP/user-agent server-controlled. The review found browser-simple cross-site requests could still forward forged events (R2); stricter content-type/provenance checks require repair verification. A caller-declared allowed URL is not proof of request origin.
- The retained Supabase migration source `003_security_hardening.sql` adds `admin_users`, `is_admin()`, admin-only RLS policies, removes public booking inserts, and adds booking integrity/overlap constraints.
- Booking notification emails now escape booking fields before rendering HTML.
- Legacy CSV-export code quotes cells and guards formula injection; its presence does not make the offline legacy admin operational or provide the future D1 export feature.
- Worker responses now include baseline security headers.

## Headers and Content Security Policy

- Every Worker response carries `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` and `Strict-Transport-Security: max-age=31536000` (`withSecurityHeaders` in `worker/index.ts`).
- HSTS has no `includeSubDomains` on purpose: other subdomains of the domain (mail records, future tools) are not all known to serve HTTPS, and a browser keeps the rule for a year.
- The CSP is report-only (`CSP_REPORT_ONLY`). On 2026-10-10, 9 live pages were loaded with marketing consent (GTM, GA4, Meta Pixel, Turnstile, map) and showed no violation; measurement hits were blocked during the test.
- It stays report-only for now: every new GTM tag (for example Google Ads) needs its hosts added first, or the enforced policy would block it without notice.

## Security smoke

`npm run smoke:security` (and the "Security smoke" GitHub workflow, run by hand or every Monday at 06:00 UTC) checks the live headers and that the APIs reject bad input. Its default target is `https://beautyfacelift-zuerich.ch`.

- It sends requests to `/api/contact` and `/api/track` that must be rejected (no Turnstile token, unknown event, raw personal data). Nothing is delivered.
- While the Supabase backend of the legacy booking system is offline, the `/api/services` checks print SKIP and only check the security headers. The Supabase anon check prints SKIP when the project host does not resolve.

## Legacy security backlog — separate from this repair

The user decided on 2026-10-10 to retain the legacy code. Steps 1–4 below are a historical restoration/hardening checklist, not authorization to restore it, rotate keys, apply a remote migration or delete the project in this repair. Confirm account/data state and scope first; public enquiries/tracking/Treatwell do not depend on this backend. Production secret configuration in steps 5–6 is a dated record, not a fresh secret inventory.

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

## Unreleased automated-email repair candidate

The cockpit repair candidate uses stable provider `Idempotency-Key` values for each logical confirmation/reminder. Confirmation reservations enforce the same-address window and at most 20 per hour atomically, including in-flight reservations. Combined verification is pending; customer email remains off.

A network error, timeout, HTTP 408/409 or server error can follow provider acceptance. Such delivery stays **uncertain**: keep the reservation, record `mail_failed` with `delivery: uncertain`/`retry: manual`, and do not automatically resend. The agency must reconcile provider delivery records before any separately approved recovery. A definitive rejection can release the claim; reminder retries wait at least two hours and reuse the logical delivery key. This is neither a guarantee of delivery nor authority to clear a claim/send mail blindly. See the cockpit runbook on the cockpit branch and the final repaired-stack verification.
