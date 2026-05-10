# Pending Work

Last updated: 2026-05-10 (Treatwell booking links restored; Meta ads docs corrected)

Current live state: https://beautyfacelift.mediapaulo.workers.dev — Workers deploy, official Treatwell catalog returns 65 services via `/api/services`, public booking CTAs point to Treatwell, contact/tracking hardening is live, and Supabase migration history is repaired.

Important operational note: Supabase migration bookkeeping matches local migrations. Before future production DB migrations, run `supabase db push --linked --dry-run` and take a logical backup with Docker Desktop or native `pg_dump`. See [SUPABASE-MIGRATION-STATUS.md](SUPABASE-MIGRATION-STATUS.md).

---

## Recently completed

- **Security hardening live** — booking validation, admin allowlist RLS, private admin helper, booking overlap constraint, contact Turnstile fail-closed behavior, tracking validation, email escaping, CSV injection protection, baseline Worker security headers, and CSP report-only monitoring are implemented.
- **Contact runtime configured** — Cloudflare Turnstile and Resend secrets are present on the Worker. Current sender configuration is suitable for development only until the real domain is verified.
- **Repeatable smoke checks** — `npm run smoke:security` verifies live API and header behavior against the `.workers.dev` deployment.
- **Treatwell catalog live** — `/api/services` returns the official 65-service catalog.
- **Treatwell booking destination restored** — public booking links point to `https://buchung.treatwell.ch/ort/beauty-face-lift/`; `/termin/` is noindex and forwards to Treatwell.
- **Supabase migration bookkeeping repaired** — local migration records align with production history.

---

## Blocks launch on custom domain

### 1. Connect `beautyfacelift.ch` to Cloudflare DNS

The current public target is still the `.workers.dev` URL. Connecting the real domain unblocks:

- Real domain in browser, SEO, and share links
- Google Search Console DNS verification
- Resend sender-domain verification
- Worker custom domain binding
- Production Supabase Auth redirect URLs

What to do when DNS access is available: find the current DNS host of `beautyfacelift.ch`, transfer nameservers to Cloudflare or move the zone, then in Cloudflare dashboard go to Workers & Pages -> `beautyfacelift` -> Settings -> Domains & Routes -> Add Custom Domain for `beautyfacelift.ch` and `www.beautyfacelift.ch`.

### 2. Revoke and rotate exposed credentials

Credentials pasted into chat or logs must be treated as temporary development credentials.

Before real launch:

- Revoke the temporary Resend API key and create a new sending key.
- Revoke the temporary Cloudflare API token and create a new least-privilege token only when needed.
- Rotate the Supabase `service_role` key, then update Cloudflare with `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name beautyfacelift`.
- Rotate the Supabase database password if it was shared outside the dashboard.

### 3. Replace admin credentials and auth redirects

The admin account is allowlisted in `admin_users`, but the password and auth redirect configuration still need production cleanup:

- Replace the admin password with a strong unique password.
- Enable MFA where available.
- Update Supabase Auth Site URL and Redirect URLs so password recovery goes to the live Worker/custom domain instead of localhost.
- Keep public signups disabled.
- Enable leaked-password protection.

---

## High-impact features not yet wired

### Stripe deposits

Status: partial code exists, but deposits should remain disabled.

Required before enabling:

- Stripe secret, publishable, and webhook keys
- Payment-intent route
- Booking flow integration
- `stripe_payment_intent_id` storage
- Verified webhook route that updates booking payment state
- Refund/cancellation policy and tests

### Production email domain

Current status: Resend works for development using a temporary sender setup. Customer-facing sender reputation and broad delivery require a verified domain.

Required after DNS access:

- Verify `beautyfacelift.ch` in Resend with DKIM/SPF/DMARC DNS records.
- Switch Worker `CONTACT_FROM_EMAIL` to a domain sender such as `Beauty Face Lift <kontakt@beautyfacelift.ch>`.
- Switch Supabase Edge Function email sender secrets to the verified domain.
- Send a live contact and booking notification test.

### Growth and analytics

Blocked until the real domain is connected:

- Google Search Console
- Google Business Profile
- GA4 server-side measurement secrets
- Meta Pixel/CAPI secrets plus `PUBLIC_META_PIXEL_ID`
- Optional GTM container

Meta ads note: until Treatwell can report completed appointments back to Meta, optimize for the website `Lead` event emitted on Treatwell booking clicks. Do not report this as a confirmed booking conversion.

---

## Design and content backlog

- Studio interior and treatment-card imagery still need real or approved generated assets.
- Content Security Policy is live in report-only mode. Move to enforcement only after observing the real custom-domain launch with Turnstile, analytics, and Meta scripts enabled.
- The stale Claude worktree contains a V2 homepage preview at `src/pages/v2/` plus `src/styles/homepage-v2.css`; keep it as reference until a dedicated UX/conversion PR decides whether to adopt or delete it.
- Track Cloudflare `wrangler-action` for a future Node 24-native release; GitHub-owned checkout/setup actions already use v6.
