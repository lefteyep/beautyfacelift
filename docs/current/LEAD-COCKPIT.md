# Lead cockpit — unreleased implementation runbook

**21 October 2026: IMPLEMENTATION IN PROGRESS; combined verification pending.** This documents the existing #55–#57 code and repair candidate `1cc4c9`, not a deployed cockpit. Authentication choice/setup is deferred; no Access/Zero Trust activation or custom OTP work is authorized by this runbook. Before any D1 rollout complete the disclosure, retention/deletion, alerting and reconciliation gates in [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md). Customer mail stays off, reminders agency-only and Teresa unexposed. Phase 2 is held.

The lead cockpit is a small, server-rendered tool inside the Worker for working through enquiries: who asked, who has been contacted, who booked, who came. It reads and writes the D1 database `beautyfacelift-leads`, where ingestion is attempted before the owner email. Storage failure deliberately allows that email to succeed; some accepted enquiries can therefore be missing from D1. Reconciliation/recovery must be defined before rollout (see `worker/leads/ingest.ts`).

- **URL:** `https://beautyfacelift-zuerich.ch/admin/leads/`
- **Code:** `worker/leads/` — `access.ts` (Access JWT), `csrf.ts`, `time.ts` (Zurich time, ISO week, opening hours), `html.ts` (layout, escaping, inline CSS), `views/list.ts`, `views/detail.ts`, `router.ts`; SQL only in `db.ts`.
- **No JavaScript:** plain HTML pages, plain links and POST forms.
- **Automatic e-mails and Cron:** `worker/email/` (sender, layout, templates) and `worker/cron/automations.ts`; see below.

## Who can log in

The current unreleased implementation is designed for the following protection if Access is later selected and configured. No production Access policy is established by this repair:

1. **Cloudflare Access** (Zero Trust) in front of `beautyfacelift-zuerich.ch/admin`. Login method: **One-time PIN** by e-mail only. The policy allows exactly the addresses listed in it.
2. **The Worker** verifies the Access JWT itself on every `/admin/*` request (`worker/leads/access.ts`): signature (RS256) against `${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs` (keys cached 1 h, refetched on an unknown `kid` at most once a minute; after a failed fetch every request is denied without refetching for 60 s), `iss`, `aud`, `exp` and `nbf` (60 s clock leeway), and `email` in `ACCESS_ALLOWED_EMAILS`. The header `Cf-Access-Authenticated-User-Email` is never trusted on its own. Denials are logged as `Access denied for /admin/: <reason>`, except requests without any token (bots, the security smoke). Encoded or doubled spellings of the path (`/%61dmin/`, `//admin/`) are guarded too.

Anything else gets a 401 page "Nicht angemeldet." with a "Erneut anmelden" button (no automatic redirect). The legacy static pages under `/admin/` (`/admin/`, `/admin/design-system/`) are behind the same guard.

The source allow-list contains only the agency address. Any later configured policy must remain agency-only until a separately approved go-live; its current dashboard state was not verified.

## Configuration

| Name | Where | Value |
|---|---|---|
| `ACCESS_TEAM_DOMAIN` | `wrangler.jsonc` var | Full origin, e.g. `https://<team>.cloudflareaccess.com` (no trailing slash). Must equal the JWT `iss`. |
| `ACCESS_AUD` | `wrangler.jsonc` var | Application Audience (AUD) tag of the Access application. |
| `ACCESS_ALLOWED_EMAILS` | `wrangler.jsonc` var | Comma-separated addresses; today `mediapaulo@gmail.com`. |
| `LEADS_SIGNING_SECRET` | Worker secret (dashboard) | 32 random bytes as hex. Signs the CSRF tokens (and later the unsubscribe links). |
| `ENVIRONMENT` | `wrangler.jsonc` var | `production`. The dev bypass is impossible while this is `production`. |
| `LEADS_DEV_EMAIL` | `.dev.vars` only | Local identity for the dev bypass. Never set in production. |

Fail-closed behaviour:

- `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` or `ACCESS_ALLOWED_EMAILS` empty → every `/admin/*` request answers 401. This is the state until the Access application exists.
- `LEADS_SIGNING_SECRET` missing → the pages still render, every change (POST) answers 503 "Konfiguration unvollständig."
- `LEADS_DB` not bound → 503 "Datenbank nicht verbunden."

### Conditional reference if Access is later selected

These are reference steps from the existing design, not permission to activate Zero Trust or an approved choice of provider/session duration. Verify current product, pricing and checkout requirements at decision time. A custom login would need its full security/session lifecycle designed and tested separately.

1. Zero Trust → Settings → Authentication: login method **One-time PIN** only (no Google or other identity providers).
2. Access → Applications → Add → **Self-hosted**: domain `beautyfacelift-zuerich.ch`, path `admin`; session duration **2 weeks**; App Launcher visibility **off**.
3. Policy: **Allow**, include **Emails**: the agency address only.
4. Copy the application's **AUD** tag and the team domain into `wrangler.jsonc` (`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN` as `https://<team>.cloudflareaccess.com`); keep `ACCESS_ALLOWED_EMAILS` in line with the policy.
5. Workers & Pages → `beautyfacelift` → Settings → Variables and Secrets: add the secret `LEADS_SIGNING_SECRET` (for example the output of `openssl rand -hex 32`).
6. Ship the `wrangler.jsonc` change through a reviewed PR (the deploy rewrites the plain vars; secrets are kept).

## Pages and actions

| Route | What it does |
|---|---|
| `GET /admin/leads/` | List. KPI strip for the current ISO week (Zurich): Neu, Kontaktiert, Gebucht, Erschienen, Termin-Quote = (gebucht + erschienen + no_show) / all leads of the week. Filters `?status=offen` (default: neu + kontaktiert + gebucht) \| each status \| `alle`; `?q=` searches name, e-mail and phone (phone also in normalised form, so `079 123` finds `+41 79 123 …`); `?campaign=` exact; `?page=` (50 rows, newest first). Rows show source, status, relative time, treatment/topic, and "Anrufen"/"WhatsApp" when a phone exists. |
| `GET /admin/leads/:id/` | Detail: WhatsApp (prefilled greeting), Anrufen, E-Mail, "Jetzt kontaktiert", the forms below, the enquiry data incl. UTM and click IDs, a "Wiederkehrend" link when the same e-mail/phone enquired within 30 days, and the timeline. |
| `POST …/contacted/` | "Jetzt kontaktiert": sets `first_contact_at` the first time only, `contact_attempts + 1`, status `neu → kontaktiert` (other statuses stay). |
| `POST …/status/` | Sets the status. A short note is required for Nicht erschienen, Abgesagt and Nicht erreicht. |
| `POST …/appointment/` | Date + time in Zurich time → `appointment_at` (UTC). "Status auf Gebucht setzen" (checked by default while neu/kontaktiert) also sets the status. |
| `POST …/revenue/` | Revenue of the first visit in whole CHF (0–100'000, empty = unknown) and "Folgetermin gebucht?" ja / nein / unbekannt. |
| `POST …/notes/` | Internal notes (up to 4000 characters), replaces the previous text. |
| `POST …/exclude/` | Test / Spam / Nicht ausschliessen. |

Every POST answers `303` back to the detail page with a confirmation line (`?ok=`), or re-renders the page with status 400 and a "Bitte …" message at the form when the input is invalid. Each change writes a `lead_events` row with the actor (Teresa / Agentur / System / E-Mail); the timeline shows them newest first. The actor is "Teresa" for the studio's address and "Agentur" for any other allowed address.

## Status model

| Status | Use when |
|---|---|
| Neu | The enquiry arrived; nobody has answered yet. |
| Kontaktiert | The studio has replied (call, WhatsApp, e-mail). "Jetzt kontaktiert" sets it automatically from Neu. |
| Gebucht | An appointment exists. Usually set with the appointment form. |
| Erschienen | The client came to the appointment. |
| Nicht erschienen (`no_show`) | Booked but did not come. Note required. |
| Abgesagt | The client cancelled or declined. Note required. |
| Nicht erreicht | Several attempts without an answer. Note required. |

"Offen" in the list means Neu, Kontaktiert and Gebucht.

## Exclusion

Test entries and spam are not deleted. "Ausschliessen" marks them (`exclude = 'test' | 'spam'`): they disappear from every list view except "Alle" (where they carry a "Test"/"Spam" chip), do not count in the weekly KPIs and are ignored by the duplicate detection. "Nicht ausschliessen" reverses it.

## Automatic e-mails

Both mails go through `sendEmail()` in `worker/email/resend.ts` (Resend API, sender `CONTACT_FROM_EMAIL`). That sender has **no fallback** to Resend's shared test sender: without `RESEND_API_KEY` or `CONTACT_FROM_EMAIL` nothing is sent and a `mail_failed` event records the missing setting. Look: `worker/email/layout.ts` (cream background, paper card, Georgia heading, clay button, no images, plain-text twin). Copy rules: German, "Sie", Swiss "ss", no prices, no "CHF", no result claims; `npm run qa:leads` checks every file under `worker/email/`. The owner enquiry e-mail (`worker/routes/contact.ts`) is unchanged and has no cockpit link.

### Customer confirmation of receipt

- **When:** right after an enquiry, once the owner e-mail went out and the lead row exists. `worker/routes/contact.ts` queues `sendConfirmationIfDue()` (`worker/email/confirmation.ts`) with `ctx.waitUntil`, so the form's answer is never delayed or changed.
- **Switch:** sent only while `LEADS_CUSTOMER_MAILS` is exactly `on`. `wrangler.jsonc` deliberately does not set it, so production sends **no** confirmations until go-live.
- **Skipped when:** the switch is off; no database/valid email; test/spam exclusion; already reserved/sent; suspicious greeting; the same address has a reservation in the last 24 hours; or 20 confirmations are already reserved/sent in the last 60 minutes. The repaired candidate enforces address/hour eligibility in the atomic reservation, including in-flight sends across distinct leads. These controls still need combined verification before mail can be enabled.
- **Reservation and delivery:** `claimConfirmation` atomically checks quotas and reserves `confirmation_sent_at`. The provider request uses `Idempotency-Key: bfl:confirmation:<lead-id>`. Success records `mail_sent`. A definitive rejection releases the reservation and records `mail_failed`; confirmations have no automatic retry. Network/timeouts, 408/409 and server errors are uncertain: keep the reservation, record `delivery: uncertain` and `retry: manual`, and require agency reconciliation. A timestamp can mean an unresolved reservation, not proven delivery.
- **Variants** (`worker/email/templates/confirmation.ts`): contact page ("Ihre Anfrage bei Beauty Face Lift"), Aquafacial ad page ("Ihre Aquafacial-Anfrage bei Beauty Face Lift"), Aquafacial + Microneedling ad page ("Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift"; adds "Das Angebot gilt bis …" from `CAMPAIGN_OFFERS` while the date has not passed). Content: thanks, "Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages, per …", WhatsApp and phone for questions, the button "Termin online buchen" (absolute `/termin/` link, with the ad page's service), the address, the signature with opening hours, and the line "Diese E-Mail bestätigt den Eingang Ihrer Anfrage." No opt-out link (the mail answers the customer's own request) and no cockpit link.

### Reminder to the studio ("nudge")

- **When:** a lead is still `neu`, not marked test/spam and was not reminded yet, and arrived at least `NUDGE_AFTER_MINUTES` (60) minutes ago. Only within opening hours (`OPENING_HOURS_WEEKLY`, Zurich time): the first run after opening catches up on the leads that arrived while the studio was closed. At most 20 per run, oldest first.
- **Recipient:** `LEADS_NUDGE_TO` only (`wrangler.jsonc`: the agency address until go-live). Reply-to is the same address. Missing → nothing is sent and the run logs "LEADS_NUDGE_TO is missing".
- **Content** (`worker/email/templates/nudge.ts`): subject "Noch offen: Anfrage von {Name} (seit {n} Min.)"; source, treatment/topic, arrival time, phone, e-mail, preferred contact and time, the message (up to 300 characters); buttons "Anrufen" (`tel:`), "WhatsApp" (`wa.me` with the prefilled greeting) and "Im Lead-Cockpit öffnen".
- **Reservation and delivery:** `nudge_sent_at` is claimed before sending and the provider uses stable `Idempotency-Key: bfl:nudge:<lead-id>`. Success writes `nudge_sent`. A definitive rejection releases the reservation and writes `mail_failed`; retry is no earlier than **2 h** later using the same logical key. Network/timeouts, 408/409 and server errors retain the reservation and are not automatically retried. See uncertain delivery below; do not describe this as guaranteed delivery or automatically clear claims.

## Agency procedure for uncertain delivery

This procedure is required before rollout; an alert/reconciliation owner still needs to be assigned. The repair candidate records uncertain delivery as `mail_failed` with `delivery: uncertain` and `retry: manual`, retaining the send reservation. The stable provider key does not authorize unlimited or blind retries.

1. Alert the responsible agency operator; record lead ID, mail kind and time without copying personal data into public logs/issues.
2. Inspect the correct project's provider delivery record using the logical key, time and any returned message ID. Do not use another client's Resend connection. If accepted/delivered, preserve the reservation and document the reconciliation.
3. If acceptance cannot be established, leave the reservation in place and escalate to the agency owner. No automatic resend, direct database reset or client/customer test email is authorized. A recovery action needs a separately approved, documented plan that accounts for provider idempotency retention and duplicate risk.
4. Record what was verified and the outcome. A stored lead, a reservation timestamp and an actual email delivery are different facts.

## Cron

- **Schedule:** `*/15 * * * *` (`triggers.crons` in `wrangler.jsonc`). The `scheduled` handler in `worker/index.ts` runs `runAutomations(env, scheduledTime)` (`worker/cron/automations.ts`) through `ctx.waitUntil`; errors are logged as "Lead automations failed:", a run that sent or failed something logs one summary line (counts only).
- **Local test:** with `.dev.vars` containing `RESEND_API_KEY=invalid` and `LEADS_NUDGE_TO=agency@example.test` (never a real address), run `npm run d1:migrate:local`, `npm run build && npx wrangler dev --test-scheduled --port 8787`, then:
  ```
  curl "http://127.0.0.1:8787/__scheduled?cron=*/15+*+*+*+*"
  ```
  Prefer the fully stubbed harness; this manual recipe is historical reference and can still attempt an outbound provider request. An invalid key is not proof that no network call occurred. No real secret/address belongs in a local test. A definitive rejection records `mail_failed` in local D1. The run only does something within opening hours (Zurich time) and for leads older than 60 minutes.

## Local development

1. `.dev.vars` (gitignored) with at least:
   ```
   ENVIRONMENT=development
   LEADS_DEV_EMAIL=you@example.com
   LEADS_SIGNING_SECRET=any-long-random-string
   ```
   The dev bypass needs all three conditions: `ENVIRONMENT` is not `production`, `LEADS_DEV_EMAIL` is set, and the host is `localhost`, `127.0.0.1` or `[::1]`.
2. `npm run d1:migrate:local`
3. `npm run build && npx wrangler dev --port 8787 --local-upstream localhost:8787 --upstream-protocol http`
   Plain `npm run cf:dev` is not enough here: because of the custom-domain routes, wrangler dev hands the Worker the production host, so the canonical-host redirect answers 301 and the dev bypass (localhost only) never applies.
4. Open `http://localhost:8787/admin/leads/`. Test leads can be created by posting JSON with `"campaign": "aquafacial_aktion"` (no Turnstile) to `http://localhost:8787/api/contact`. Without `RESEND_API_KEY` the route stores the row first and then answers 503; no mail request leaves the machine.

## Checks

- `npm run harness:leads-access` — the Access guard through the real Worker entry: self-signed RS256 test JWTs (header and cookie), 401 for missing/expired/wrong-aud/wrong-iss/wrong-email/foreign-key tokens, the certs cache and the unknown-`kid` refetch, fail-closed config, the dev bypass rules, the legacy `/admin/` page behind the guard.
- `npm run harness:leads-cockpit` — list, filters, search, KPIs, escaping, all six actions, CSRF (403), the 400 validation paths, Zurich time (`2026-11-03 14:30` → `13:30Z`), 503 without secret or database, 404/405, paging.
- `npm run harness:leads-cron` — the reminder (61 minutes at Tue 11:00 → one mail, overlapping and repeated runs → none, Sunday none, Monday 10:00 CET sent, excluded never, definitive rejection → released claim + 2 h back-off, network/408/409/5xx → retained uncertain reservation/no automatic resend, stable provider keys, missing config), the customer confirmation (off by default, sent once when on, concurrent distinct-lead 24 h same-address and exact 20/hour limits including in-flight sends, rejection/uncertain paths, offer date), and both entry points of `worker/index.ts` (`scheduled`, `POST /api/contact`).
- `npm run qa:leads` — source checks (fonts, Access/CSRF wiring, config, docs, Swiss spelling, mail copy without "CHF", the `LEADS_CUSTOMER_MAILS` switch).
- `npm run smoke:security` — `/admin/` and `/admin/leads/` must answer 302 to `*.cloudflareaccess.com` or 401/403, never 200.

The harnesses stub `globalThis.fetch`; they never call Cloudflare or Resend and never send e-mail.

## Security model

- Identity: the Worker verifies the Access JWT itself (see above); no session of its own, no passwords.
- CSRF: every POST must come from the same origin (`Sec-Fetch-Site: same-origin`, or a matching `Origin` when the header is absent) and carry the hidden `_csrf` = HMAC-SHA256(`LEADS_SIGNING_SECRET`, `csrf:` + e-mail + `:` + JWT `exp`), compared in constant time. Failure → 403 "Ungültige Anfrage."
- Output: every value from the database or the request is HTML-escaped (`esc()` / the `html` template tag in `worker/leads/html.ts`). URLs from enquiries are shown as text, never as links.
- Headers: `/admin/*` responses carry `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` and the site's security headers; pages have `<meta name="robots" content="noindex, nofollow">`.
- No JavaScript, no third-party requests; fonts are served from `/fonts/`.

## Go-live remains a separate decision

Do not execute the previous automatic go-live sequence. The current gates are in [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) and [LEAD-COCKPIT-PLAN.md](LEAD-COCKPIT-PLAN.md): repaired/verified code, data disclosure/retention/deletion and reconciliation readiness, a chosen/tested staff authentication path, and explicit rollout approval.

Until a separately tested go-live is approved, keep customer confirmations off, reminders agency-only, staff access agency-only, no cockpit link in owner emails, and no Teresa test mail. Introducing Teresa, enabling customer email or changing recipient policy must not happen automatically with a merge. The original runbook/go-live checklist is preserved in [the PR57 snapshot](../archive/reviews/2026-10-21-pre-repair/LEAD-COCKPIT-PR57.md).
