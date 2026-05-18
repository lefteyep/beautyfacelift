# Pending Work

Last updated: 2026-05-07 (post-launch documentation)

Current production URL: https://beautyfacelift-zuerich.ch — Workers custom-domain launch is live. The temporary workers.dev URL must not be used as the public canonical URL.

Do not configure, redirect, or migrate `beautyfacelift.ch`; it remains separate.

---

## Recently completed (2026-04-24)

- **Real Teresa portrait sitewide** — replaced the `consultationTrust` stock placeholder with the real `teresa_portrait.jpg` on the homepage about-section, `ueber-uns` hero/og-image/schema.org founder image, and the Carbon Microneedling LP "Deine Expertin" block. Source PNG (1.7MB) compressed to ~100KB JPEG for both the Astro Image pipeline (`src/assets/marketing/`) and the direct og:image (`public/assets/`). Astro emits WebP variants at build.
- **Author avatar on blog posts** — added a 96px circular Teresa avatar to the author bio on all five blog articles and the `BlogPost.astro` layout. `.blog-author-bio` switched from flex to CSS grid so the avatar spans the bio rows cleanly without wrapping markup.
- **Reusable optimisation script** — [`scripts/optimize-teresa.mjs`](../scripts/optimize-teresa.mjs) regenerates both JPEGs from the source PNG via sharp.

## Recently completed (2026-04-20)

- **Sitewide width regression fixed** — removed the leftover `.container` double-wrap from 15 `.about-editorial` + 1 `.faq-section` sections across 7 pages. Every editorial section now centres correctly at 1920px viewport (computed `padding-left: 340px`, was 58px). See [LAYOUT-SYSTEM.md § Follow-up: sitewide container cleanup](LAYOUT-SYSTEM.md#follow-up-sitewide-container-cleanup-2026-04-20).
- **Behandlungen nav dropdown added** — desktop hover/keyboard reveals 4 treatment links; mobile overlay shows flat indented sub-items. See [LAYOUT-SYSTEM.md § Follow-up: Behandlungen nav dropdown](LAYOUT-SYSTEM.md#follow-up-behandlungen-nav-dropdown-2026-04-20).

---

## Completed domain launch work (2026-05-07)

- `beautyfacelift-zuerich.ch` is active on Cloudflare nameservers `ezra.ns.cloudflare.com` and `ryleigh.ns.cloudflare.com`.
- Worker custom domains are deployed for `beautyfacelift-zuerich.ch` and `www.beautyfacelift-zuerich.ch`.
- `www` returns a 301 redirect to the canonical apex while preserving path and query string.
- `workers_dev=false` is active; `beautyfacelift.mediapaulo.workers.dev` returned 404 in live verification.
- all-inkl mail records were preserved in Cloudflare DNS; all-inkl website records for the new domain were removed from Cloudflare DNS so the Worker owns website traffic.
- Deployed Worker version recorded in the launch log: `f376e963-48cf-4708-9130-650ed6e48b4b`.

Full launch log and verification commands: [domain-launch-beautyfacelift-zuerich.md](domain-launch-beautyfacelift-zuerich.md).

## Critical production hardening still required

### 1. Rotate Supabase `service_role` key

A previous `service_role` value was exposed during migration and must be considered compromised. Rotate in Supabase dashboard → Project Settings → API Keys → Rotate. Then run `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name beautyfacelift` with the new value.

### 2. Replace admin credentials

Weak test admin credentials were documented during migration. Replace the Supabase Auth password with a strong unique password before first real customer data reaches `/admin/`, and allowlist only the owner user in `public.admin_users`.

---

## 🟡 High-impact features not yet wired

### Stripe deposits (code ready, blocked on keys)

**Status:** `DepositStep.tsx` component exists but disconnected from `BookingWidget.tsx`.

**What's needed:**
- `STRIPE_SECRET_KEY`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- Code changes:
  - Add `worker/routes/create-payment-intent.ts` route
  - Extend `worker/index.ts` router to dispatch to it
  - Import `DepositStep` into `BookingWidget.tsx`, extend to 5 steps
  - Rework booking submit flow so booking is created BEFORE deposit step, then deposit captured against the booking ID
  - Add `stripe_payment_intent_id` column to `bookings` table (Supabase migration)
  - Webhook route to mark bookings as `paid` on `payment_intent.succeeded`

Estimated effort: 2-3 hours of implementation once keys are in hand.

### Real images (partially done)

**Status:** Teresa's portrait is now the real photo sitewide (2026-04-24). Studio interior and treatment cards remain generic stock with misleading alt text.

See [docs/IMAGES.md](IMAGES.md) for the full image brief — exact paths, dimensions, alt text context, and AI generation prompts for each.

**Important:** Teresa's portrait (`teresa_portrait.jpg`) must be a real photo — never AI-generate a founder headshot. Everything else can be AI-generated as a stopgap.

---

## 🟢 Production email (sandbox → live)

**Currently:** Working in Resend sandbox mode (`EMAIL_FROM=onboarding@resend.dev`). Owner notifications deliver to the Resend account owner's email only. Customer emails silently drop.

**To go live:**
1. Choose the sender domain intentionally:
   - for the new domain, verify `beautyfacelift-zuerich.ch` in Resend and use a sender such as `noreply@beautyfacelift-zuerich.ch`
   - for the old domain, coordinate separately and do not modify old-domain DNS as part of this launch
2. In Resend dashboard → Domains → Add Domain → follow the DNS record instructions.
3. Add the provider's DNS records to the Cloudflare zone only for the domain being verified.
4. Once verified, add the sender value to Supabase Edge Function secrets.
5. No code change required.

The new domain is now on Cloudflare, so new-domain sender verification is no longer blocked by nameserver setup.

---

## 🟢 Growth / marketing setup

The custom domain is connected; these are now post-launch setup tasks.

- **Google Search Console** — add property, verify via DNS TXT record, submit `https://beautyfacelift-zuerich.ch/sitemap.xml`
- **Google Business Profile** — claim Beauty Face Lift, verify via postcard (takes ~5 days)
- **GA4** — create property, add `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` as Worker secrets. Server-side tracking already wired in `worker/routes/track.ts`.
- **Meta Pixel** — create Pixel, add `META_PIXEL_ID` + `META_ACCESS_TOKEN` as Worker secrets. CAPI already wired.
- **GTM** — create container, add `PUBLIC_GTM_ID` as build-time env var.

---

## 🟢 Nice-to-haves

- Supabase Edge Function `notify-booking` — earlier notes record this as deployed on 2026-04-15, but production email delivery still needs live verification before relying on it.
- Delete the Pages project **done** (2026-04-15)
- Remove `functions.legacy/` **done** (2026-04-15)
- Tag `v2.0.0-workers` **done** (2026-04-15)
- Node.js 24 upgrade for GitHub Actions — currently on deprecated Node 20 runners. Set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` in workflow env when ready. Not urgent — forced default June 2026.
