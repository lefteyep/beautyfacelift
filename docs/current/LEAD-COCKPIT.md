# Lead cockpit — runbook (agency pilot)

**Status 30 October 2026: cockpit pilot deployed, agency-only.** PR #62 (`codex/cockpit-pilot`, "Cockpit pilot: agency cockpit with manual recovery and guarded D1 operations") was merged into `master` on 2026-10-30 as `e2e53d7`. GitHub marked #55 and #56 as merged by that; #57 is superseded and closed separately (its only extra content was the login note, now in [Access application](#access-application-created-2026-10-30)). Deploy run [40996067370](https://github.com/lefteyep/beautyfacelift/actions/runs/40996067370) succeeded: `npm run validate` green, D1 migration `0001_leads.sql` applied to `beautyfacelift-leads` (the first CI migration), Worker version `01404b09-3727-4a67-81e8-ef592093e609` and the cron trigger `*/15 * * * *` deployed. Verified on production on 2026-10-30: public pages answer 200; anonymous `/admin/` and `/admin/leads/` answer 302 to `mediapaulo.cloudflareaccess.com`; D1 has the tables `leads`, `lead_events` and `d1_migrations` (the lead tables are empty).

**Switches:** lead capture (`LEADS_CAPTURE`) is `on` with the configuration change that carries this update (it was `off` at the 2026-10-30 deploy). Reminders (`LEADS_REMINDERS`) and data operations (`LEADS_DATA_OPERATIONS`) stay `off`; customer confirmations stay off (`LEADS_CUSTOMER_MAILS` unset). Every recipient (`LEADS_FORWARD_TO`, `LEADS_NUDGE_TO`, `LEADS_ALERT_TO`, `LEADS_DATA_OPERATORS`) and `ACCESS_ALLOWED_EMAILS` is `mediapaulo@gmail.com`. Teresa is not informed and gets no cockpit link. Open before go-live: a labelled test enquiry, the reminders activation, the privacy decisions (data owner, retention, deletion, monitoring) and the storage alert activation; see [TODO.md](TODO.md). Phase 2 is held.

**Pilot scope:** [COCKPIT-PILOT-2026-10-21.md](COCKPIT-PILOT-2026-10-21.md) and [the pilot workflow](COCKPIT-PILOT-WORKFLOW.md) describe the pilot. It adds protected manual capture/recovery and removes initial weekly KPIs/revenue entry. Public notification UUID/time supports reconciliation; failures use sanitized operational logs/alerts. Route tables and automation descriptions below document the earlier stack; the pilot gates apply first.

The lead cockpit is a small, server-rendered tool inside the Worker for working through enquiries: who asked, who has been contacted, who booked, who came. It reads and writes the D1 database `beautyfacelift-leads`. With capture on, public enquiries are stored in D1 before the owner e-mail is sent; a storage failure is logged and reported to `LEADS_ALERT_TO` after the owner mail attempt and never blocks the enquiry. Some accepted enquiries can therefore be missing from D1; the manual entry page `/admin/leads/new/` records or recovers them (it answers "Konfiguration unvollständig" while capture is off). The owner e-mail is unchanged (see `worker/leads/ingest.ts`).

- **URL:** `https://beautyfacelift-zuerich.ch/admin/leads/`
- **Code:** `worker/leads/` — `access.ts` (Access JWT), `csrf.ts`, `time.ts` (Zurich time), `html.ts` (layout, escaping, inline CSS), `views/list.ts`, `views/detail.ts`, `views/manual.ts`, `router.ts`; ordinary persistence in `db.ts`, separately bounded data operations in `erasure.ts`/`erasure-route.ts`.
- **No JavaScript:** plain HTML pages, plain links and POST forms.
- **Automatic e-mails and Cron:** `worker/email/` (sender, layout, templates) and `worker/cron/automations.ts`; see below.

## Who can log in

Two layers protect the cockpit:

1. **Cloudflare Access** in front of `beautyfacelift-zuerich.ch/admin` and descendants (application details in [Access application](#access-application-created-2026-10-30)). Login is a **one-time PIN by e-mail**, the session lasts **2 weeks**, and the Allow policy includes only `mediapaulo@gmail.com`.
2. **The Worker** verifies the Access JWT itself on every `/admin/*` request (`worker/leads/access.ts`): signature (RS256) against `${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs` (keys cached 1 h, refetched on an unknown `kid` at most once a minute; after a failed fetch every request is denied without refetching for 60 s), `iss`, `aud`, `exp` and `nbf` (60 s clock leeway), and `email` in `ACCESS_ALLOWED_EMAILS`. The header `Cf-Access-Authenticated-User-Email` is never trusted on its own. Denials are logged as `Access denied for /admin/: <reason>`, except requests without any token (bots, the security smoke). Encoded or doubled spellings of the path (`/%61dmin/`, `//admin/`) are guarded too.

Anything else gets a 401 page "Nicht angemeldet." with a "Erneut anmelden" button (no automatic redirect). The legacy static pages under `/admin/` (`/admin/`, `/admin/design-system/`) are behind the same guard.

The source allow-list contains only the agency address. Any later policy change must remain agency-only until a separately approved go-live. On production (checked 2026-10-30) anonymous requests to `/admin/` and `/admin/leads/` answer 302 to `mediapaulo.cloudflareaccess.com`. The 21 October planning record is [Access readiness](COCKPIT-ACCESS-READINESS.md) (history).

## Configuration

| Name | Where | Value |
|---|---|---|
| `ACCESS_TEAM_DOMAIN` | `wrangler.jsonc` var | Full origin, e.g. `https://<team>.cloudflareaccess.com` (no trailing slash). Must equal the JWT `iss`. |
| `ACCESS_AUD` | `wrangler.jsonc` var | Application Audience (AUD) tag of the Access application. |
| `ACCESS_ALLOWED_EMAILS` | `wrangler.jsonc` var | Comma-separated addresses; today `mediapaulo@gmail.com`. |
| `LEADS_SIGNING_SECRET` | Worker secret (dashboard) | 32 random bytes as hex. Signs the CSRF tokens (and later the unsubscribe links). |
| `ENVIRONMENT` | `wrangler.jsonc` var | `production`. The dev bypass is impossible while this is `production`. |
| `LEADS_DEV_EMAIL` | `.dev.vars` only | Local identity for the dev bypass. Never set in production. |
| `LEADS_CAPTURE` | `wrangler.jsonc` var | `on` since the 2026-10-30 capture change: public forms and the manual entry page `/admin/leads/new/` store leads in D1. |
| `LEADS_REMINDERS` | `wrangler.jsonc` var | `off`; separate reviewed activation required. |
| `LEADS_DATA_OPERATIONS` | `wrangler.jsonc` var | `off`; enables only the separately authorized data procedure. |
| `LEADS_DATA_OPERATORS` | `wrangler.jsonc` var | Exact agency-only mailboxes; ordinary cockpit access does not confer erasure rights. |

Fail-closed behaviour:

- `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` or `ACCESS_ALLOWED_EMAILS` empty → every `/admin/*` request answers 401. All three are set in `wrangler.jsonc` since the Access application exists.
- `LEADS_SIGNING_SECRET` missing → the pages still render, every change (POST) answers 503 "Konfiguration unvollständig."
- `LEADS_DB` not bound → 503 "Datenbank nicht verbunden."

## Access application (created 2026-10-30)

- Zero Trust team domain `https://mediapaulo.cloudflareaccess.com` (Zero Trust Free).
- Login method: One-time PIN by e-mail (Cloudflare Access sends a code from noreply@notify.cloudflare.com; the account-wide One-time PIN provider is used). The "Cloudflare" account-login provider created the same day is not used by the cockpit (user decision 2026-10-30).
- Application "Beauty Face Lift – Agenturcockpit", id `841aa372-3175-4f04-a96e-4b68b61e2656`, self-hosted, destination `beautyfacelift-zuerich.ch/admin`, session 2 weeks (user decision 2026-10-30, changed from 1 h), only the One-time PIN provider, hidden from the App Launcher. AUD `25cd22da8935572227bcc67375d4a4450edf41a2840eb6f072c4ed82a30a490f` (`ACCESS_AUD`).
- Policy "Agentur – nur mediapaulo", id `ee29d487-c93d-45f7-9bac-fa584b8c66b4`: Allow, Emails = `mediapaulo@gmail.com`, duration same as the application. `ACCESS_ALLOWED_EMAILS` matches it.
- Since the application exists, every `/admin` page on production asks for the Access login, whatever the deployed Worker serves behind it.
- The Worker secret `LEADS_SIGNING_SECRET` is set (dashboard secret, never a plain variable or a committed value).
- Any change to the login method, session, policy or allowed addresses is a separate, reviewed decision; keep `ACCESS_ALLOWED_EMAILS` identical to the policy.

## Pages and actions

| Route | What it does |
|---|---|
| `GET /admin/leads/` | List without weekly KPIs. Filters `?status=offen` (default: neu + kontaktiert + gebucht) \| each status \| `alle`; `?q=` searches name, e-mail and phone (phone also in normalised form, so `079 123` finds `+41 79 123 …`); `?campaign=` exact; `?page=` (50 rows, newest first). Rows show source, status, relative time, treatment/topic, and "Anrufen"/"WhatsApp" when a phone exists. |
| `GET/POST /admin/leads/new/` | Manual phone/WhatsApp capture and reference-based recovery, behind capture/auth/CSRF gates; no outgoing mail. |
| `GET/POST /admin/leads/data/erase/` | Independently gated agency operator procedure; exact-ID preview, explicit confirmation and atomic stale-data guard. See [data operations](LEAD-D1-ERASURE.md); absent from normal staff navigation. |
| `GET /admin/leads/:id/` | Detail: WhatsApp (prefilled greeting), Anrufen, E-Mail, "Jetzt kontaktiert", the forms below, the enquiry data incl. UTM and click IDs, a "Wiederkehrend" link when the same e-mail/phone enquired within 30 days, and the timeline. |
| `POST …/contacted/` | "Jetzt kontaktiert": sets `first_contact_at` the first time only, `contact_attempts + 1`, status `neu → kontaktiert` (other statuses stay). |
| `POST …/status/` | Sets the status. A short note is required for Nicht erschienen, Abgesagt and Nicht erreicht. |
| `POST …/appointment/` | Date + time in Zurich time → `appointment_at` (UTC). "Status auf Gebucht setzen" (checked by default while neu/kontaktiert) also sets the status. |
| `POST …/revenue/` | Existing protected compatibility endpoint; revenue/follow-up fields are absent from the initial pilot UI. |
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

Both mails go through `sendEmail()` in `worker/email/resend.ts` (Resend API, sender `CONTACT_FROM_EMAIL`). That sender has **no fallback** to Resend's shared test sender: without `RESEND_API_KEY` or `CONTACT_FROM_EMAIL` nothing is sent and a `mail_failed` event records the missing setting. Look: `worker/email/layout.ts` (cream background, paper card, Georgia heading, clay button, no images, plain-text twin). Copy rules: German, "Sie", Swiss "ss", no prices, no "CHF", no result claims; `npm run qa:leads` checks every file under `worker/email/`. The owner enquiry e-mail (`worker/routes/contact.ts`) still has no cockpit link; the pilot adds enquiry UUID and received time even while capture is off. The normal owner/BCC delivery attempt remains independent of D1 persistence.

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

This procedure is required before reminders or customer confirmations are switched on; an alert/reconciliation owner still needs to be assigned. The repair candidate records uncertain delivery as `mail_failed` with `delivery: uncertain` and `retry: manual`, retaining the send reservation. The stable provider key does not authorize unlimited or blind retries.

1. Alert the responsible agency operator; record lead ID, mail kind and time without copying personal data into public logs/issues.
2. Inspect the correct project's provider delivery record using the logical key, time and any returned message ID. Do not use another client's Resend connection. If accepted/delivered, preserve the reservation and document the reconciliation.
3. If acceptance cannot be established, leave the reservation in place and escalate to the agency owner. No automatic resend, direct database reset or client/customer test email is authorized. A recovery action needs a separately approved, documented plan that accounts for provider idempotency retention and duplicate risk.
4. Record what was verified and the outcome. A stored lead, a reservation timestamp and an actual email delivery are different facts.

## Cron

- **Schedule:** `*/15 * * * *` (`triggers.crons` in `wrangler.jsonc`). The `scheduled` handler in `worker/index.ts` runs `runAutomations(env, scheduledTime)` (`worker/cron/automations.ts`) through `ctx.waitUntil`; errors are logged as "Lead automations failed:", a run that sent or failed something logs one summary line (counts only).
- **Local test:** use `npm run harness:leads-cron`. It invokes the real scheduled entry point with synthetic data and stubbed provider requests, including outside-hours, quota, overlapping-run and uncertain-delivery cases. No `.dev.vars`, real key, real address or externally reachable scheduled endpoint is needed. An invalid API key alone would not prevent an outbound request and is not the test isolation mechanism.

## Local development

Use the existing synthetic preview for routine UI review:

1. With project dependencies and Node 22.13+ installed, run `npm run build`, then `npm run preview:cockpit`.
2. Open `http://127.0.0.1:4357/admin/leads/`. The preview binds only loopback, creates its own in-memory synthetic D1 fixture and local development identity, and blocks every Worker external fetch. It reads no `.env`/`.dev.vars` or cloud credentials. Use only synthetic contact values.
3. Exercise existing cockpit/manual workflows; stop the preview after review. Its in-memory changes are not retained. Use finite `harness:*` commands for assertions and fault cases.

This preview does not implement or test a real Cloudflare login. The production dev bypass remains impossible: it requires a non-production environment, a local identity and a loopback host. No public contact-form submission or remote D1 setup is needed. A plain `wrangler dev` session with project routes/secrets is not the isolated preview described here.

## Checks

- `npm run harness:leads-access` — the Access guard through the real Worker entry: self-signed RS256 test JWTs (header and cookie), 401 for missing/expired/wrong-aud/wrong-iss/wrong-email/foreign-key tokens, the certs cache and the unknown-`kid` refetch, fail-closed config, the dev bypass rules, the legacy `/admin/` page behind the guard.
- `npm run harness:leads-cockpit` — list, filters, search, initial KPI/revenue UI absence, escaping, existing protected actions, CSRF (403), the 400 validation paths, Zurich time (`2026-11-03 14:30` → `13:30Z`), 503 without secret or database, 404/405, paging. `harness:leads-manual` covers synthetic capture/recovery and replay; the erasure harnesses cover the separately gated operator procedure.
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

The agency pilot is deployed; go-live for the studio is not. Do not execute the previous automatic go-live sequence. The remaining gates are in [TODO.md](TODO.md), [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) and [LEAD-COCKPIT-PLAN.md](LEAD-COCKPIT-PLAN.md): data disclosure/retention/deletion and monitoring decisions, reconciliation readiness, a tested staff login for the studio, and explicit go-live approval.

Until a separately tested go-live is approved, keep customer confirmations off, reminders off (agency-only once activated), staff access agency-only, no cockpit link in owner emails, the studio owner (Teresa) not informed, and no Teresa test mail. Introducing Teresa, enabling customer email or changing recipient policy must not happen automatically with a merge. The original runbook/go-live checklist is preserved in [the PR57 snapshot](../archive/reviews/2026-10-21-pre-repair/LEAD-COCKPIT-PR57.md).
