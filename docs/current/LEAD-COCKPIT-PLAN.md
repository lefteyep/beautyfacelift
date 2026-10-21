# Lead-Cockpit — approved implementation plan (2026-10-20)

> Copied verbatim from the Claude Code plan file that the user approved on 2026-10-20. Phase 1 is implemented in PRs #55 (ingest), #56 (cockpit + Access) and #57 (mails + Cron), all unmerged as of 2026-10-21; see [HANDOVER-2026-10-21.md](HANDOVER-2026-10-21.md) for the current state and the open prerequisites. Paths below are written for the original Windows checkout; in this repository they are relative to the repo root (`worker/…`, `shared/…`, `scripts/…`).

---

# Lead-Cockpit: online lead tracker + automated follow-ups (Beauty Face Lift)

## Context

The Meta combo campaign needs a lead-quality loop (campaign plan §3.6): who enquired, how fast Teresa replied, who booked, who showed up, revenue. Today that is an Excel file the agency would fill by hand from the enquiry e-mails. The user wants it **online, interactive and fed by the website**, plus **automated follow-ups** (confirmation to the customer, nudge to Teresa, one follow-up, review request, newsletter opt-in). Decisions taken on 2026-10-20:

- **In-house on Cloudflare** (no SaaS CRM, no Google services, no Vercel): D1 database + protected pages on the existing Worker + Cron Trigger + Resend mails + Cloudflare Email Routing for Treatwell booking mails. Treatwell has no API or connector (verified), so "sync" = reading Treatwell's notification e-mails.
- **No SMS / WhatsApp automation**; the cockpit gives one-tap WhatsApp/phone links with prefilled text.
- **The campaign waits until the tracker page is live** (Phase 1 incl. cockpit). The combo offer on the page ends 14 Nov 2026; if Phase 1 slips past ~28 Oct, the end date must move (page + 3 ad images + ad copy), to be raised with the user then.
- **Teresa learns nothing about this until it is finished and fully tested.** Until the go-live step: Access policy contains only the agency address; nudge mails go to the agency only; no customer-facing confirmation/follow-up mails to real customers; no cockpit link in the owner e-mail; no test mails to info@beautyfacelift.ch. The go-live step flips all of that at once.

Repo: `C:\Users\Nutzer\Desktop\Projekte\Kunden\beautyfacelift\astro-v2` (master `43fc8fb`). Work on `codex/*` branches in `..\astro-v2-worktrees\`, one PR per batch, merge only on the user's explicit go; CI deploys on push to master. Rules: Swiss "ss", "Sie" in all mails, no prices/claims in automated mail, no Google sign-in, no Gmail services.

## Architecture (one paragraph)

`worker/index.ts` gets three handlers: `fetch` (new `/admin/*` branch: Cloudflare Access JWT verified in the Worker, `/admin/leads/*` server-rendered HTML without JS; plus public signed `/api/leads/unsubscribe`), `scheduled` (Cron every 15 min: nudge, follow-up, review, retention; at-most-once via conditional `UPDATE … WHERE col IS NULL`), `email` (Email Routing delivers `bookings@…` to the Worker: capture raw mail in D1, always forward to Teresa's inbox, parse Treatwell bookings once samples exist). One D1 database `beautyfacelift-leads` (binding `LEADS_DB`, location hint Western Europe) with `leads`, `lead_events`, `ad_spend`, `inbound_mail`. `contactRoute` inserts the lead row before sending the owner mail and queues the customer confirmation with `ctx.waitUntil`. Mail goes through the existing Resend sender; Reply-To `info@beautyfacelift.ch`. Everything is on the Cloudflare Free plan (D1, Cron, Email Workers, Access ≤50 users); no Queues.

Facts that shape the build (verified):
- Apex MX of `beautyfacelift-zuerich.ch` points to all-inkl (`w01402c3.kasserver.com`, SPF `include:spf.kasserver.com`); Resend uses `send.` (MX `feedback-smtp.eu-west-1.amazonses.com`). Enabling Email Routing on the apex replaces that MX → **gate: the user confirms no mailbox exists at all-inkl for this domain**; fallback: Email Routing on a subdomain (`bookings@mail.beautyfacelift-zuerich.ch`) or Teresa's Treatwell notification address set to the routed address.
- `build.inlineStylesheets: 'always'` → no linkable site CSS; the cockpit inlines its own CSS with the token values and ships the two brand fonts from `public/fonts/` (copied from `@fontsource`), so it looks like the brand, not like a tool.
- `OFFER_VALID_UNTIL = '2026-11-14'` is pinned in `src/pages/lp/aquafacial-microneedling/index.astro:22` and asserted by `scripts/check-aquafacial-lp-offer.mjs`; `shared/leads.ts` carries a copy, drift-checked by `qa:leads`.
- Forms post JSON; `/kontakt/` sends `source="kontakt-page"`, combo `source="aquafacial-microneedling-lp"`, `/lp/aquafacial/` sends none (campaign `aquafacial_aktion`); `parseSubmission` currently drops `source`.
- `OPENING_HOURS` in `shared/site.ts` are display strings (`'10:00 - 20:00'`); the Worker needs a structured weekly table in `shared/leads.ts`, drift-checked.
- `scripts/security-smoke.mjs:203` expects `/admin/` to answer 200 → changes with Access (must answer 302 to `*.cloudflareaccess.com` or 401, never 200).
- Local Node 24 has `node:sqlite` → harness fake D1 without native deps; CI Node 22 → bump `engines.node` to `>=22.13.0`.
- CSP needs no change (no scripts, `style-src 'unsafe-inline'`, `form-action 'self'` already allowed).

## Files

New (all under `astro-v2\`):
- `worker/migrations/0001_leads.sql` (P1), `worker/migrations/0002_inbound_mail_and_spend.sql` (P2)
- `shared/leads.ts` — statuses + German labels, sources, `CAMPAIGN_OFFERS` (validUntil, bookingService), `OPENING_HOURS_WEEKLY`, timing constants, WhatsApp prefill template, `normalizeEmail`, `normalizePhone`
- `worker/leads/db.ts` (typed D1 access incl. `claimAutomation`), `access.ts` (Access JWT), `csrf.ts`, `time.ts` (Zurich↔UTC via `Intl`, ISO week, opening hours), `html.ts` (layout, `esc`, inline CSS), `views/list.ts`, `views/detail.ts`, `router.ts`; P2: `views/report.ts`, `spend.ts`, `inbound.ts`, `new.ts`, `csv.ts`
- `worker/email/resend.ts` (`sendEmail`, P2 audience upsert/unsubscribe), `layout.ts` (text + table HTML frame, signature), `templates/confirmation.ts`, `nudge.ts`; P2 `followup.ts`, `review.ts`
- `worker/cron/automations.ts` (`runAutomations(env, now)`)
- P2: `worker/inbound/handler.ts`, `worker/inbound/treatwell-parser.ts`, `worker/routes/leads-unsubscribe.ts`
- `scripts/check-leads.mjs` (`npm run qa:leads`), `scripts/harness/fake-d1.mjs`, `scripts/harness/leads-ingest.mts`, `leads-access.mts`, `leads-cockpit.mts`, `leads-cron.mts`; P2 `scripts/check-treatwell-parser.mjs` + `scripts/fixtures/treatwell/*.eml` + `expected.json`
- `public/fonts/instrument-serif-400.woff2`, `public/fonts/instrument-sans-variable.woff2`
- `docs/current/LEAD-COCKPIT.md` (runbook; Teresa one-pager in German, handed over only at go-live)
- `.dev.vars.example`

Changed: `wrangler.jsonc`, `.github/workflows/deploy.yml`, `worker/index.ts`, `worker/env.ts`, `worker/routes/contact.ts`, `src/pages/lp/aquafacial/index.astro` (hidden `source`), `scripts/security-smoke.mjs`, `scripts/check-contact-concierge.mjs`, `scripts/check-aquafacial-aktion-lp-offer.mjs`, `scripts/check-aquafacial-lp-offer.mjs`, `scripts/check-docs-current.mjs`, `package.json`; P2: the three form pages (opt-in checkbox), `src/pages/datenschutz/index.astro`, docs (STATUS, TODO, SECURITY, SETUP, ARCHITECTURE, META-CAMPAIGN §3.6, docs/README).

## D1 schema (0001, Phase 1)

Conventions: ISO-8601 UTC strings written by the Worker; whole CHF `INTEGER`; booleans 0/1; ids `crypto.randomUUID()`; statuses ASCII slugs (`neu | kontaktiert | gebucht | erschienen | no_show | abgesagt | nicht_erreicht`); migrations additive only.

```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  source TEXT NOT NULL,            -- kontakt-page | aquafacial-lp | aquafacial-microneedling-lp | manual
  campaign TEXT NOT NULL DEFAULT '', offer TEXT NOT NULL DEFAULT '', treatment TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '', landing_page TEXT NOT NULL DEFAULT '', page_url TEXT NOT NULL DEFAULT '', referrer TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL, email TEXT, email_normalized TEXT, phone TEXT, phone_normalized TEXT,
  preferred_contact_method TEXT NOT NULL DEFAULT '', preferred_callback_time TEXT NOT NULL DEFAULT '', preferred_date TEXT NOT NULL DEFAULT '',
  skin_goal TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '', utm_medium TEXT NOT NULL DEFAULT '', utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '', utm_term TEXT NOT NULL DEFAULT '', fbclid TEXT NOT NULL DEFAULT '', gclid TEXT NOT NULL DEFAULT '', msclkid TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'neu', status_changed_at TEXT NOT NULL, first_contact_at TEXT, contact_attempts INTEGER NOT NULL DEFAULT 0,
  appointment_at TEXT, revenue_first_visit_chf INTEGER, follow_up_booked INTEGER, notes TEXT NOT NULL DEFAULT '',
  marketing_consent INTEGER NOT NULL DEFAULT 0, marketing_consent_at TEXT, marketing_synced_at TEXT,
  confirmation_sent_at TEXT, nudge_sent_at TEXT, followup_sent_at TEXT, review_sent_at TEXT, unsubscribed_at TEXT,
  returning_of_lead_id TEXT, treatwell_booking_ref TEXT, exclude TEXT  -- NULL | 'test' | 'spam'
);
CREATE INDEX idx_leads_created_at ON leads(created_at); CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email_normalized ON leads(email_normalized); CREATE INDEX idx_leads_phone_normalized ON leads(phone_normalized);
CREATE INDEX idx_leads_utm_content ON leads(utm_content);
CREATE TABLE lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  at TEXT NOT NULL, type TEXT NOT NULL, actor TEXT NOT NULL, from_status TEXT, to_status TEXT, note TEXT, meta TEXT
);
CREATE INDEX idx_lead_events_lead ON lead_events(lead_id, at);
```
`0002` (P2): `ad_spend(week 'YYYY-Www', campaign, platform, spend_chf, note, UNIQUE(week,campaign,platform))` and `inbound_mail(id, received_at, from_address, to_address, subject, message_id UNIQUE, raw_size, headers_json, text_excerpt, raw ≤900k chars, parse_status, parse_result JSON, lead_id, forwarded, error)`.

## Phase 1 — campaign prerequisite (3 PRs, in this order)

**PR A `codex/leads-ingest`** (silent; nothing visible to Teresa or customers)
- `contactRoute(request, env, ctx)` (thread `ctx` from `worker/index.ts`): after Turnstile → `createLeadFromSubmission` in try/catch (normalised e-mail/phone, `status='neu'`, duplicate within 30 days by e-mail or phone → `returning_of_lead_id`, one `db.batch` with the `created` event); on any D1 error log and continue; skip silently when `env.LEADS_DB` is undefined. Then the owner mail as today (no cockpit link yet). Response unchanged (201 / 303).
- `parseSubmission` reads `source` and `marketingConsent|marketing_consent` (stored, no UI yet); `/lp/aquafacial/` gets `<input type="hidden" name="source" value="aquafacial-lp">`; `leadSourceFor()` maps campaign → source when `source` is missing.
- `wrangler.jsonc`: `d1_databases` (`LEADS_DB`, `beautyfacelift-leads`, `migrations_dir: "worker/migrations"`), `triggers.crons: ["*/15 * * * *"]` (handler lands in PR C; an empty `scheduled` is fine), vars `LEADS_FORWARD_TO`, `LEADS_NUDGE_TO` (agency address until go-live). `deploy.yml`: wrangler-action `preCommands: npx wrangler d1 migrations apply beautyfacelift-leads --remote` + `command: deploy`. `env.ts` additions: `LEADS_DB?: D1Database; ACCESS_TEAM_DOMAIN?; ACCESS_AUD?; ACCESS_ALLOWED_EMAILS?; LEADS_SIGNING_SECRET?; LEADS_DEV_EMAIL?; LEADS_FORWARD_TO?; LEADS_NUDGE_TO?; LEADS_CUSTOMER_MAILS?; RESEND_AUDIENCE_ID?; GOOGLE_REVIEW_URL?`.
- Harness `fake-d1.mjs` (wraps `node:sqlite` `DatabaseSync` in the D1 shape: `prepare().bind().run()/first()/all()`, `batch()`, `meta.changes`, applies `worker/migrations/*.sql`), `leads-ingest.mts` (row + event created; duplicate linked; D1 throwing → mail still sent, 201). `check-leads.mjs` v1. Docs: SETUP/SECURITY notes.
- Prerequisites (user, dashboard): create D1 `beautyfacelift-leads` (Western Europe) → `database_id` into `wrangler.jsonc`; extend the GitHub API token with **D1:Edit** (else the migration step fails and nothing deploys, which is safe).

**PR B `codex/leads-cockpit`** (agency-only access)
- `worker/leads/access.ts`: for every `/admin/*` request read `Cf-Access-Jwt-Assertion` (fallback `CF_Authorization` cookie), RS256 via WebCrypto against `${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs` (cached 1 h, refetch on unknown `kid`), claims `iss`, `aud` = `ACCESS_AUD`, `exp`, `email` ∈ `ACCESS_ALLOWED_EMAILS`; else 401 HTML "Nicht angemeldet" with a link (no auto-redirect). Never trust `Cf-Access-Authenticated-User-Email` alone. Dev bypass only when `ENVIRONMENT !== 'production'` AND `LEADS_DEV_EMAIL` set AND host is localhost (values from `.dev.vars`; production always has `ENVIRONMENT=production` because `wrangler.jsonc` rewrites vars on deploy). Static legacy `/admin/*` pages fall through to assets after the guard (also protected now).
- Routes (GET pages, POST actions, every POST through `verifyCsrf`: `Sec-Fetch-Site` same-origin or matching `Origin`, plus hidden `_csrf` = HMAC(`LEADS_SIGNING_SECRET`, `csrf:`+email+`:`+jwt.exp), 303 back with `?ok=`):
  ```
  GET  /admin/leads/                 list: ?status=offen|neu|kontaktiert|gebucht|erschienen|no_show|abgesagt|nicht_erreicht|alle, ?q=, ?campaign=, ?page=
  GET  /admin/leads/:id/             detail + timeline
  POST /admin/leads/:id/contacted/   "Jetzt kontaktiert": first_contact_at once, contact_attempts+1, neu→kontaktiert
  POST /admin/leads/:id/status/      status (+ optional note; final statuses ask for one)
  POST /admin/leads/:id/appointment/ date + time (Zurich) → appointment_at UTC; optional set_status=gebucht
  POST /admin/leads/:id/revenue/     revenue_chf, follow_up_booked (ja|nein|unbekannt)
  POST /admin/leads/:id/notes/       notes
  POST /admin/leads/:id/exclude/     test|spam|none
  ```
- UI: mobile-first; KPI strip for the ISO week (Neu, Kontaktiert, Gebucht, Erschienen, Termin-Quote); filter chips (default `offen` = neu+kontaktiert+gebucht); search; rows with source badge, relative time, status badge, `tel:`/`wa.me` icons. Detail: big buttons WhatsApp (prefilled "Guten Tag {Vorname}, hier ist Teresa Stimac von Beauty Face Lift. Vielen Dank für Ihre Anfrage zu {Behandlung}. Wann passt es Ihnen für einen Termin?"), Anrufen, E-Mail; "Jetzt kontaktiert"; status buttons; appointment/revenue/notes forms; enquiry block incl. UTM and returning-lead link; timeline (actor shown as Teresa / Agentur / System / E-Mail). Inline CSS with the brand tokens (`--cream #FAF6F1`, `--paper #FFFCF9`, `--clay #8F5A2E`, `--cocoa #2A1E18`, `--text #4A3B33`, `--muted #76655A`, `--error #9B2C1F`, radii 8/12/20/pill) and `@font-face` for Instrument Serif/Sans from `public/fonts/`. `esc()` on every value (pattern: `htmlErrorResponse` in `contact.ts`); responses pass `withSecurityHeaders` (already no-store + noindex for `/admin/`).
- `security-smoke.mjs`: `/admin/` and `/admin/leads/` must answer 302 to `*.cloudflareaccess.com` or 401/403, never 200. Harnesses `leads-access.mts` (self-signed RSA test JWTs; 401 for missing/expired/wrong-aud/wrong-email; dev bypass only on localhost), `leads-cockpit.mts` (CSRF 403; contacted once; `2026-11-03 14:30` Zurich → `13:30Z`). `LEAD-COCKPIT.md` runbook.
- Prerequisites (user, Zero Trust dashboard, agency drives in Chrome with approval): team + **One-time PIN** login method only; self-hosted app `beautyfacelift-zuerich.ch/admin`, session 2 weeks, App Launcher off; policy Allow → Emails: **agency address only** (Teresa added at go-live); copy AUD → `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ACCESS_ALLOWED_EMAILS` as plain vars in `wrangler.jsonc`; secret `LEADS_SIGNING_SECRET` (32 random bytes hex) in the dashboard.

**PR C `codex/leads-mails-phase1`**
- `worker/email/resend.ts` `sendEmail(env, {to, subject, text, html, replyTo=CONTACT_EMAIL, headers?, tags?})` → `{id}`; never falls back to `onboarding@resend.dev` for customer mail. `layout.ts`: table HTML (cream bg, paper card, cocoa headings, clay button, system fonts), text builder, signature "Teresa Stimac · Beauty Face Lift · Bahnhofstrasse 94, 8001 Zürich · +41 79 214 34 62 · info@beautyfacelift.ch", opening hours from `OPENING_HOURS`, no prices.
- `templates/confirmation.ts`: variants kontakt / `aquafacial_aktion` / `aquafacial_microneedling` (adds "Das Angebot gilt bis 14. November 2026." from `CAMPAIGN_OFFERS` while not past). Body: thanks, "Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages …", WhatsApp + phone, absolute booking link via `bookingLinkForService`, address, footer "Diese E-Mail bestätigt den Eingang Ihrer Anfrage." No opt-out (answers the request).
- `sendConfirmationIfDue(env, lead)` via `ctx.waitUntil`: skip when **`LEADS_CUSTOMER_MAILS !== 'on'`** (off until go-live), no/invalid e-mail, `exclude` set, already sent, same address confirmed in last 24 h, or >20 confirmations in the last 60 min (anti-backscatter against the bot POSTs on the Turnstile-exempt LPs); conditional `UPDATE … WHERE confirmation_sent_at IS NULL` + event; failures → event `mail_failed`, no retry.
- `templates/nudge.ts` + `worker/cron/automations.ts` + `scheduled` export: candidates `status='neu' AND exclude IS NULL AND nudge_sent_at IS NULL AND created_at <= now-60min`, only within opening hours (first run after opening catches up), `claimAutomation` → send to **`LEADS_NUDGE_TO`** (agency until go-live; then `CONTACT_TO_EMAIL`, BCC agency) → event; on failure release the claim + `mail_failed` with 2 h back-off. Subject "Noch offen: Anfrage von {name} (seit {n} Min.)", one-tap tel/wa.me, cockpit link.
- Harness `leads-cron.mts` (stubbed clock: 61 min at Tue 11:00 → one nudge; second run none; Sunday none; Monday 10:00 sent). `qa:leads` asserts templates contain no "ß" and no "CHF".

**Go-live step (one small PR + dashboard, after the user has tested everything end to end and says go):** add `info@beautyfacelift.ch` to the Access policy and `ACCESS_ALLOWED_EMAILS`; `LEADS_NUDGE_TO` → `CONTACT_TO_EMAIL` (+BCC agency); `LEADS_CUSTOMER_MAILS=on`; add the line "Lead-Cockpit: https://beautyfacelift-zuerich.ch/admin/leads/<id>/" to the owner e-mail; hand Teresa the one-pager; test the OTP mail with her once (it comes from `noreply@notify.cloudflare.com`, may land in spam). **Then the campaign may start.**

## Phase 2 — after go-live (5 PRs)

- **D `leads-inbound-capture`:** migration 0002; `email` handler (capture headers/excerpt/raw → `inbound_mail`, always forward to `LEADS_FORWARD_TO`, loop guard on `X-Forwarded-For`, rethrow on forward failure so the sender sees a bounce); `/admin/leads/inbound/` pages; dependency `postal-mime` (check the lockfile with npm 10.9). Dashboard gate first: confirm no all-inkl mailbox on the domain; Email Routing (destination `info@beautyfacelift.ch` verified by Teresa — **this is after go-live, so she may know by then**; custom address `bookings@…` → Worker; catch-all Drop); Teresa sets Treatwell's notification address to it (or forwards). Capture week → anonymised fixtures.
- **E `leads-treatwell-parser`:** `parseTreatwellMail()` written against fixtures (`qa:treatwell-parser`); match by e-mail → phone → normalised name among leads of the last 90 days; booking → `gebucht` + `appointment_at` + ref; cancellation → `abgesagt`; unmatched → manual "Mit Lead verknüpfen".
- **F `leads-followup-review-unsubscribe`:** follow-up after 72 h (`neu|kontaktiert`, not unsubscribed, 09–19 Zurich, offer end date when applicable, `List-Unsubscribe` headers); review request 24 h after `erschienen` (Google review URL from `GOOGLE_REVIEW_URL` var, Treatwell link); `/api/leads/unsubscribe?t=` signed token (180 days) GET+POST, idempotent, German confirmation page; retention job (anonymise leads >24 months, clear raw mail >30 days).
- **G `leads-optin-privacy`:** unticked opt-in checkbox on the three forms (wording: "Ich möchte gelegentlich Angebote und Neuigkeiten von Beauty Face Lift per E-Mail erhalten. Die Einwilligung kann ich jederzeit widerrufen (siehe Datenschutzerklärung)."), stored; Resend Audience sync (`RESEND_AUDIENCE_ID`), revoke button in the cockpit; privacy policy: new "Stand", §2 consent item, §3 purposes (confirmation/reminder/review; offers only with consent), §4 replace "keine eigene Buchungsdatenbank…" with the D1 storage paragraph (24-month retention, Treatwell mails evaluated, IP/UA not stored in the DB), new sections "Automatische E-Mails zu Ihrer Anfrage" and "Newsletter und Angebote", provider lines (Cloudflare D1/Access/Email Routing; Resend incl. newsletters), rights (Widerruf). Client reads the text once; the agency is not a law firm. QA field lists updated.
- **H `leads-report-csv-spend`:** `/admin/leads/report/?week=` (by `utm_content`: leads, contacted, booked, shown, booking rate, show rate, first-contact median, revenue; spend block → true CPL, cost per visit, first-visit ROAS), `/admin/leads/spend/` (weekly CHF per campaign, upsert), `/admin/leads/export.csv` (UTF-8 BOM, `;`, formula-safe), manual lead form (WhatsApp enquiries). Decide then whether to delete the legacy Supabase admin code (user's call).

Phase 3 (later, not planned): Make.com webhook from `lead_events`, Meta offline conversions (gebucht/erschienen → CAPI), WhatsApp Business API.

## Verification

- Every PR: `npm run check` (0 errors), `npm run build`, `npm audit --audit-level=moderate`, all existing `qa:*`, `node scripts/seo-plan-smoke.mjs`, `npx wrangler deploy --dry-run`, new `npm run qa:leads`; harnesses with `npx tsx scripts/harness/*.mts` (fake D1 on `node:sqlite`, `globalThis.fetch` stubbed, Resend/Access captured).
- Calibration: before trusting a harness, plant one defect (e.g. drop the `IS NULL` guard in `claimAutomation`) and confirm it fails.
- Local end to end: `.dev.vars` (`ENVIRONMENT=development`, `LEADS_DEV_EMAIL`, `LEADS_SIGNING_SECRET`), `npm run d1:migrate:local`, `npm run build && npm run cf:dev` (local D1), cron via `wrangler dev --test-scheduled` + `curl "http://127.0.0.1:8787/__scheduled?cron=*/15+*+*+*+*"`.
- Live, agency only, after each Phase 1 deploy: one labelled enquiry through `/kontakt/` from a test mailbox → row appears → mark `exclude=test`; cockpit on phone via OTP to the agency address; "Jetzt kontaktiert" → WhatsApp opens prefilled; nudge arrives once at `LEADS_NUDGE_TO` after 60–75 min and not again; `npm run smoke:security` passes (admin 302/401). Confirmation mails are verified locally/with `LEADS_CUSTOMER_MAILS=on` only in dev until go-live.
- Phase 2: capture week → fixtures → `qa:treatwell-parser` green → one more real booking matched automatically.

## Open points

- All-inkl MX on the new domain: who uses it? (gate for Email Routing on the apex; fallback subdomain or Treatwell notification address).
- Google review link: derive the place-ID "write a review" URL from the Business Profile once the GBP link is updated; review mail omits the Google block until set.
- Offer end date 14 Nov vs. the later campaign start (user decision when Phase 1 is done).
- Keep or delete the legacy admin/booking code (Phase 2 decision).
- Resend free tier: 100 mails/day; fine at current volume, watch it.
