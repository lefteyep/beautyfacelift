# Lead cockpit — runbook (agency pilot)

**Status 30 October 2026: cockpit pilot deployed, agency-only.** PR #62 (`codex/cockpit-pilot`, "Cockpit pilot: agency cockpit with manual recovery and guarded D1 operations") was merged into `master` on 2026-10-30 as `e2e53d7`. GitHub marked #55 and #56 as merged by that; #57 is superseded and closed separately (its only extra content was the login note, now in [Access application](#access-application-created-2026-10-30)). Deploy run [40996067370](https://github.com/lefteyep/beautyfacelift/actions/runs/40996067370) succeeded: `npm run validate` green, D1 migration `0001_leads.sql` applied to `beautyfacelift-leads` (the first CI migration), Worker version `01404b09-3727-4a67-81e8-ef592093e609` and the cron trigger `*/15 * * * *` deployed. Verified on production on 2026-10-30: public pages answer 200; anonymous `/admin/` and `/admin/leads/` answer 302 to `mediapaulo.cloudflareaccess.com`; D1 has the tables `leads`, `lead_events` and `d1_migrations` (the lead tables are empty).

**Switches:** lead capture (`LEADS_CAPTURE`) is `on` with the configuration change that carries this update (it was `off` at the 2026-10-30 deploy). Reminders (`LEADS_REMINDERS`) and data operations (`LEADS_DATA_OPERATIONS`) stay `off`; customer confirmations stay off (`LEADS_CUSTOMER_MAILS` unset); the cockpit link in the owner e-mail stays off (`LEADS_OWNER_COCKPIT_LINK` unset). Every recipient (`LEADS_FORWARD_TO`, `LEADS_NUDGE_TO`, `LEADS_ALERT_TO`, `LEADS_DATA_OPERATORS`) and `ACCESS_ALLOWED_EMAILS` is `mediapaulo@gmail.com`. Teresa is not informed and gets no cockpit link. Open before go-live: a labelled test enquiry, the reminders activation, the remaining privacy items (deletion executor, monitoring owner; retention is 24 months after last contact and stands on the privacy page since the capture-on change) and the storage alert activation; see [TODO.md](TODO.md). The go-live package (this update) prepares every switch, the manual deletion procedure, the storage-alert steps and the German guide for Teresa ([COCKPIT-ANLEITUNG-TERESA.md](COCKPIT-ANLEITUNG-TERESA.md)); the ordered steps are in [Go-live checklist](#go-live-checklist). Phase 2 is held.

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
| `LEADS_NUDGE_TO` | `wrangler.jsonc` var | One address that receives the reminder about unanswered leads: the agency until go-live, the studio (`info@beautyfacelift.ch`) at go-live. `check-leads.mjs` accepts only these two. |
| `CONTACT_BCC_EMAIL` | Worker secret (dashboard) | The agency's blind copy of the owner enquiry e-mail (since 2026-10-10). At go-live the reminder uses the same blind copy, minus the recipient itself (`worker/cron/automations.ts`, `blindCopies`). |
| `LEADS_CUSTOMER_MAILS` | `wrangler.jsonc` var, unset | Exactly `on` sends the customer confirmation of receipt; unset or anything else keeps it off. Set at go-live only. |
| `LEADS_OWNER_COCKPIT_LINK` | `wrangler.jsonc` var, unset | Exactly `on` adds the button "Im Lead-Cockpit öffnen" (the lead's cockpit page) to the owner enquiry e-mail, only when the lead row was stored. Unset or anything else leaves the owner e-mail as it is. Set at go-live only, together with the studio address in `ACCESS_ALLOWED_EMAILS`. |

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

### Adding the studio address at go-live

Two places must name Teresa's address; the Worker denies anyone who is in only one of them. The address itself comes from the user (placeholder below: `<TERESA-ADRESSE>`). The cockpit shows the actor "Teresa" in the timeline only for `info@beautyfacelift.ch` (`CONTACT_EMAIL`, see `actorFor` in `worker/leads/access.ts`), and `scripts/check-leads.mjs` accepts only that address as the studio address. If Teresa logs in with a different address, both places need a reviewed change first.

1. **Cloudflare Access policy (user, dashboard, no deploy):** open the Zero Trust dashboard (`one.dash.cloudflare.com`, account `mediapaulo`) → **Access** → **Applications** → "Beauty Face Lift – Agenturcockpit" → **Configure** → tab **Policies** → policy "Agentur – nur mediapaulo" → **Edit** (newer dashboards open the same policy under **Access → Policies**). In the **Include** rule "Emails" add `<TERESA-ADRESSE>` as a second value (keep `mediapaulo@gmail.com`), optionally rename the policy to "Agentur + Studio", and **Save**. Change nothing else: login method stays One-time PIN, session 2 weeks, application hidden from the App Launcher.
2. **`ACCESS_ALLOWED_EMAILS` (go-live PR, deploys with the merge):** in `wrangler.jsonc` set `"ACCESS_ALLOWED_EMAILS": "mediapaulo@gmail.com,<TERESA-ADRESSE>"` (comma, no spaces needed; the Worker trims). `npm run qa:leads` checks that the list holds the agency address and at most the studio address.
3. **Order:** either first. Until both are in place Teresa cannot log in (Access blocks before the Worker, the Worker blocks after Access). After the deploy, Teresa's login test is step 6 of the [Go-live checklist](#go-live-checklist).
4. **Removing access later:** delete the address from the policy and from `ACCESS_ALLOWED_EMAILS` (a deploy). An existing Access session ends at its 2-week expiry at the latest; to end it at once, revoke the user's sessions under **Access → Applications → … → Configure → Overview → Revoke existing tokens** or in **My Team → Users**.

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

Both mails go through `sendEmail()` in `worker/email/resend.ts` (Resend API, sender `CONTACT_FROM_EMAIL`). That sender has **no fallback** to Resend's shared test sender: without `RESEND_API_KEY` or `CONTACT_FROM_EMAIL` nothing is sent and a `mail_failed` event records the missing setting. Look: `worker/email/layout.ts` (cream background, paper card, Georgia heading, clay button, no images, plain-text twin). Copy rules: German, "Sie", Swiss "ss", no prices, no "CHF", no result claims; `npm run qa:leads` checks every file under `worker/email/`. The owner enquiry e-mail (`worker/routes/contact.ts`) carries the enquiry UUID and received time; it gets the button "Im Lead-Cockpit öffnen" only while `LEADS_OWNER_COCKPIT_LINK` is exactly `on` **and** the lead row was stored (a storage failure never produces a dead link). The switch is unset until go-live, so the owner e-mail is unchanged today. The normal owner/BCC delivery attempt remains independent of D1 persistence.

### Customer confirmation of receipt

- **When:** right after an enquiry, once the owner e-mail went out and the lead row exists. `worker/routes/contact.ts` queues `sendConfirmationIfDue()` (`worker/email/confirmation.ts`) with `ctx.waitUntil`, so the form's answer is never delayed or changed.
- **Switch:** sent only while `LEADS_CUSTOMER_MAILS` is exactly `on`. `wrangler.jsonc` deliberately does not set it, so production sends **no** confirmations until go-live.
- **Skipped when:** the switch is off; no database/valid email; test/spam exclusion; already reserved/sent; suspicious greeting; the same address has a reservation in the last 24 hours; or 20 confirmations are already reserved/sent in the last 60 minutes. The repaired candidate enforces address/hour eligibility in the atomic reservation, including in-flight sends across distinct leads. These controls still need combined verification before mail can be enabled.
- **Reservation and delivery:** `claimConfirmation` atomically checks quotas and reserves `confirmation_sent_at`. The provider request uses `Idempotency-Key: bfl:confirmation:<lead-id>`. Success records `mail_sent`. A definitive rejection releases the reservation and records `mail_failed`; confirmations have no automatic retry. Network/timeouts, 408/409 and server errors are uncertain: keep the reservation, record `delivery: uncertain` and `retry: manual`, and require agency reconciliation. A timestamp can mean an unresolved reservation, not proven delivery.
- **Variants** (`worker/email/templates/confirmation.ts`, chosen by `campaign`): contact page ("Ihre Anfrage bei Beauty Face Lift"), Aquafacial ad page ("Ihre Aquafacial-Anfrage bei Beauty Face Lift"), Aquafacial + Microneedling ad page ("Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift") and Carbon-Peeling + Microneedling ad page ("Ihre Anfrage: Carbon-Peeling + Microneedling bei Beauty Face Lift"). The two offer pages add "Das Angebot gilt bis …" from `CAMPAIGN_OFFERS` (`shared/leads.ts`, locked to the pages' `OFFER_VALID_UNTIL` by `qa:leads`) while the date has not passed, and the booking button carries the offer's service. `harness:leads-cron` proves every variant, the Carbon page end to end through `POST /api/contact`. Content: thanks, "Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages, per …", WhatsApp and phone for questions, the button "Termin online buchen" (absolute `/termin/` link, with the ad page's service), the address, the signature with opening hours, and the line "Diese E-Mail bestätigt den Eingang Ihrer Anfrage." No opt-out link (the mail answers the customer's own request) and no cockpit link.

### Reminder to the studio ("nudge")

- **When:** a lead is still `neu`, not marked test/spam and was not reminded yet, and arrived at least `NUDGE_AFTER_MINUTES` (60) minutes ago. Only within opening hours (`OPENING_HOURS_WEEKLY`, Zurich time): the first run after opening catches up on the leads that arrived while the studio was closed. At most 20 per run, oldest first.
- **Recipient:** `LEADS_NUDGE_TO`, one address (`wrangler.jsonc`: the agency address until go-live, the studio address at go-live). Reply-to is the same address. Missing or not a single mailbox → nothing is sent and the run logs "LEADS_NUDGE_TO is missing". **Agency blind copy:** the addresses of `CONTACT_BCC_EMAIL` (the owner e-mail's blind copy) go into BCC, minus the recipient itself and duplicates. Today both are the agency address, so there is no BCC and no double delivery; at go-live the studio receives the reminder and the agency its copy without any code change. The `nudge_sent` event names the settings (`to`, `bcc`), never an address.
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
- `npm run harness:leads-cron` — the reminder (61 minutes at Tue 11:00 → one mail, overlapping and repeated runs → none, Sunday none, Monday 10:00 CET sent, excluded never, definitive rejection → released claim + 2 h back-off, network/408/409/5xx → retained uncertain reservation/no automatic resend, stable provider keys, missing config; the go-live recipient: studio in `to`, agency once in BCC from `CONTACT_BCC_EMAIL`, no BCC while both are the agency), the customer confirmation (off by default, sent once when on, concurrent distinct-lead 24 h same-address and exact 20/hour limits including in-flight sends, rejection/uncertain paths, the offer date of the combo and the Carbon page), and both entry points of `worker/index.ts` (`scheduled`, `POST /api/contact` with the combo and the Carbon page, the owner-link switch `LEADS_OWNER_COCKPIT_LINK` on/"ON"/off/without a stored lead).
- `npm run qa:leads` — source checks (fonts, Access/CSRF wiring, config, docs, Swiss spelling, mail copy without "CHF", the switches). The switch rules are go-live-aware: `LEADS_REMINDERS` is `on` or `off`; `LEADS_CUSTOMER_MAILS` and `LEADS_OWNER_COCKPIT_LINK` are absent, `on` or `off`; `LEADS_NUDGE_TO` is the agency or the studio address; `ACCESS_ALLOWED_EMAILS` holds the agency address and at most the studio address; the studio recipient and the owner link require the studio address in `ACCESS_ALLOWED_EMAILS`; `LEADS_FORWARD_TO`, `LEADS_DATA_OPERATIONS` and `LEADS_CAPTURE` keep their pilot values; this runbook and the Teresa guide exist with their required sections, in Swiss spelling and without technical terms in the guide.
- `npm run smoke:security` — `/admin/` and `/admin/leads/` must answer 302 to `*.cloudflareaccess.com` or 401/403, never 200.

The harnesses stub `globalThis.fetch`; they never call Cloudflare or Resend and never send e-mail.

## Security model

- Identity: the Worker verifies the Access JWT itself (see above); no session of its own, no passwords.
- CSRF: every POST must come from the same origin (`Sec-Fetch-Site: same-origin`, or a matching `Origin` when the header is absent) and carry the hidden `_csrf` = HMAC-SHA256(`LEADS_SIGNING_SECRET`, `csrf:` + e-mail + `:` + JWT `exp`), compared in constant time. Failure → 403 "Ungültige Anfrage."
- Output: every value from the database or the request is HTML-escaped (`esc()` / the `html` template tag in `worker/leads/html.ts`). URLs from enquiries are shown as text, never as links.
- Headers: `/admin/*` responses carry `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` and the site's security headers; pages have `<meta name="robots" content="noindex, nofollow">`.
- No JavaScript, no third-party requests; fonts are served from `/fonts/`.

## Go-live checklist

The user runs these steps in this order; nothing on this list happens automatically with a merge. Each step names what "done" looks like. Teresa learns about the cockpit at step 6, not before.

| # | Step | Who | Done when |
|---|---|---|---|
| 1 | **User login test:** open `https://beautyfacelift-zuerich.ch/admin/leads/`, request the one-time code for `mediapaulo@gmail.com`, log in, open an entry, log out. | User | The list renders, "Angemeldet als mediapaulo@gmail.com" shows, "Abmelden" ends the session. Note the date in TODO.md. |
| 2 | **Labelled test enquiry:** send one enquiry through `/kontakt/` with the name "TEST Agentur <date>" (the user, in a normal browser; agents never submit the live forms). | User | The owner e-mail arrives at `info@beautyfacelift.ch` with the agency BCC and an "Anfrage-ID"; the same ID appears in the cockpit list within a minute; mark it "Ausschliessen → Test". Warn Teresa beforehand that a test mail is coming, without mentioning the cockpit. |
| 3 | **AVV signed:** the Auftragsverarbeitungsvertrag between Beauty Face Lift and the agency (the agency processes the enquiries on the studio's behalf, as the privacy page section 4 says) is signed, and the provider agreements are noted ([LEAD-DATA-DISCLOSURE-DRAFT.md](LEAD-DATA-DISCLOSURE-DRAFT.md)). | User, Teresa | A signed copy is filed outside the repository; the date is noted in TODO.md. |
| 4 | **Teresa's address:** the user names the login address (expected `info@beautyfacelift.ch`, see [Adding the studio address at go-live](#adding-the-studio-address-at-go-live)) and adds it to the Access policy. | User | The policy lists both addresses; the One-time PIN method, the 2-week session and everything else are unchanged. |
| 5 | **Switches (go-live PR on `wrangler.jsonc`, reviewed, merged by the user):** `ACCESS_ALLOWED_EMAILS` = agency + studio; `LEADS_NUDGE_TO` = `info@beautyfacelift.ch`; `LEADS_REMINDERS` = `on`; `LEADS_OWNER_COCKPIT_LINK` = `on`; `LEADS_CUSTOMER_MAILS` = `on`. `LEADS_FORWARD_TO`, `LEADS_ALERT_TO`, `LEADS_DATA_OPERATORS` stay the agency address; `LEADS_DATA_OPERATIONS` stays `off`. The switches may also go live in stages (Access + owner link first, reminders next, customer mails last); every stage is its own reviewed merge. The storage alert ([Storage alert activation](#storage-alert-activation)) is activated in the same step. | User | `npm run validate` is green on the PR, the deploy run succeeds, `npx wrangler deploy --dry-run` showed the new vars. From now on: reminders go to the studio with the agency in BCC, owner e-mails carry the cockpit button, customers receive the confirmation of receipt. |
| 6 | **Teresa login test:** hand Teresa [COCKPIT-ANLEITUNG-TERESA.md](COCKPIT-ANLEITUNG-TERESA.md) (as PDF or printed), let her request her code, log in on her phone, open the test entry from step 2 and tap "Jetzt kontaktiert". | Teresa, user on the phone | Her login works; the timeline of the test entry shows the actor "Teresa"; she knows the four actions (open, "Jetzt kontaktiert", "Termin eintragen", "Ausschliessen"). |
| 7 | **Go:** the user confirms go-live in writing in the orchestrator chat. | User | TODO.md and STATUS.md record the date; the [agency procedure for uncertain delivery](#agency-procedure-for-uncertain-delivery) has a named owner; the deletion procedure below has a named executor (the agency). |

Before step 5 nothing reaches Teresa or a customer: the switches are the only change that does, and they are unset or `off` on `master`.

## Deleting a lead on request

`LEADS_DATA_OPERATIONS` stays `off`; the protected route `/admin/leads/data/erase/` is not used in the pilot. Deletions are done by hand by the agency (the user), on the customer's request (privacy page section 8: deletion right, retention 24 months after the last contact). Teresa forwards every request to the agency and does not delete anything herself (the cockpit has no delete button by design). Expected time: the same working day, at the latest within 30 days.

1. **Receive and record the request** without copying personal data into chats, issues or this repository: date, channel (e-mail/phone/WhatsApp to the studio or the agency), who asked (name only in the private log). Private log: `output/coordination/deletions.md` on the agency machine (outside git, like the pilot evidence folder).
2. **Find every row of that person:** in the cockpit search `?q=` by e-mail and by phone (the search also matches normalised phone numbers), filter "Alle" so test/spam marks are included, and open each hit: note the lead ID (the UUID in the page URL) and follow every "Wiederkehrend" link (repeat enquiries within 30 days) and manual entries (`Quelle: Manuell`). Write the IDs into the private log.
3. **Delete in D1:** Cloudflare dashboard → **Storage & Databases → D1 SQL Database → `beautyfacelift-leads` → Console**, or locally `npx wrangler d1 execute beautyfacelift-leads --remote --command "…"` with the logged-in agency account. Run in this order, one ID list for all statements:

   ```sql
   SELECT id, created_at, status, exclude FROM leads WHERE id IN ('<id-1>', '<id-2>');   -- confirm the rows
   UPDATE leads SET returning_of_lead_id = NULL WHERE returning_of_lead_id IN ('<id-1>', '<id-2>');
   DELETE FROM lead_events WHERE lead_id IN ('<id-1>', '<id-2>');
   DELETE FROM leads WHERE id IN ('<id-1>', '<id-2>');
   SELECT count(*) FROM leads WHERE id IN ('<id-1>', '<id-2>');                           -- must be 0
   SELECT id, lead_id FROM lead_events WHERE meta LIKE '%<id-1>%' OR meta LIKE '%<id-2>%';  -- must be empty
   ```

   `lead_events.lead_id` cascades on delete, but the explicit `DELETE FROM lead_events` keeps the order obvious. The last query finds events of other leads that still mention a deleted ID (e.g. a "Wiederkehrend" event); edit or delete those rows too.
4. **Delete the e-mail copies:** the owner enquiry e-mail in `info@beautyfacelift.ch` (Teresa) and the agency BCC copy, any reminder ("Noch offen: …") and the Resend log entry if Resend still shows the mail (Resend → Emails → the entry; Resend's own retention applies). The customer's confirmation of receipt is in the customer's mailbox and is theirs.
5. **Verify:** the cockpit search finds nothing for the e-mail and the phone; the SQL counts are 0.
6. **Backups:** D1 Time Travel keeps restore points for the plan's period (7 days on the Free plan, see [COCKPIT-OPERATIONS-READINESS-2026-10-21.md](COCKPIT-OPERATIONS-READINESS-2026-10-21.md)); the deleted data remains restorable until that period has passed and is not restored for any other reason. No manual export of the database exists; if one was made for a drill, delete the rows there too or delete the export.
7. **Evidence and confirmation:** complete the private log line (IDs, statements run, verification result, mailbox copies deleted, executed by, date). Teresa confirms the deletion to the customer in the studio's name; the agency confirms to Teresa. Nothing of this goes into TODO.md or STATUS.md beyond "deletion request handled on <date>".

## Storage alert activation

The alert for failed lead storage (`lead_storage_failed` in the Worker logs, see `worker/leads/storage-alert.ts`) exists only as an unsaved dashboard draft ([COCKPIT-OPERATIONS-READINESS-2026-10-21.md](COCKPIT-OPERATIONS-READINESS-2026-10-21.md), user decision 2026-10-21: draft only). The user activates it at go-live (step 5). Dashboard steps (Cloudflare account `mediapaulo`, account ID `ee2019b3b7bc0527ffa154de4d2349ca`):

1. **Destination:** `dash.cloudflare.com` → **Manage Account → Notifications → Destinations**. If `mediapaulo@gmail.com` is not listed as a verified e-mail destination, add it and confirm the verification mail. No other destination.
2. **Alert:** **Notifications → Add** → choose the custom/query alert on **Workers Logs** (the dialog that offers `logs.workersLogs`, `scriptName` and `message`).
   - Name: `beautyfacelift – Lead-Speicherfehler`.
   - Data: Workers Logs, this account, `scriptName = beautyfacelift`.
   - Condition: `message LIKE '%lead_storage_failed%'`, return the count only (the query is saved as [operations/lead-storage-alert.sql](operations/lead-storage-alert.sql)); threshold `>= 1`; evaluation window `10m`; automatic time range.
   - Schedule: execution interval `10m`, repeat alert interval `1h`.
   - Recipient: the e-mail destination from step 1.
   - Description: leave empty or "D1 lead storage failed; reconcile owner e-mails with the cockpit (LEAD-COCKPIT.md)". Never an enquiry ID, a name or message text in name or description.
3. **Save** (the earlier draft was never saved; saving creates the alert). The preview shows 0 matches: expected, no failure has happened.
4. **Do not touch** the existing Passive Origin alert in the same list.
5. **Proof:** a test notification, if the dialog offers one, proves the delivery path. The query itself can only be proven by a real storage failure; until then, the saved alert and the verified destination are the evidence. Record the activation date in TODO.md.
6. **When it fires:** follow the alert mail from the Worker (`LEADS_ALERT_TO`) or this notification: compare the owner e-mails of that hour (each has an "Anfrage-ID") with the cockpit list, and record missing enquiries through `/admin/leads/new/` (recovery by reference). Never resend a form.

## Go-live remains a separate decision

The agency pilot is deployed; go-live for the studio is not. Do not execute the previous automatic go-live sequence. The remaining gates are in [TODO.md](TODO.md), [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) and [LEAD-COCKPIT-PLAN.md](LEAD-COCKPIT-PLAN.md): data disclosure/retention/deletion and monitoring decisions, reconciliation readiness, a tested staff login for the studio, and explicit go-live approval.

Until a separately tested go-live is approved, keep customer confirmations off (`LEADS_CUSTOMER_MAILS` unset), reminders off (`LEADS_REMINDERS` `off`; agency-only once activated), staff access agency-only, no cockpit link in owner e-mails (`LEADS_OWNER_COCKPIT_LINK` unset), the studio owner (Teresa) not informed, and no Teresa test mail. Introducing Teresa, enabling customer e-mail or changing the recipient policy must not happen automatically with a merge: every switch above is a `wrangler.jsonc` value the user changes in a reviewed go-live PR ([Go-live checklist](#go-live-checklist)). The original runbook/go-live checklist is preserved in [the PR57 snapshot](../archive/reviews/2026-10-21-pre-repair/LEAD-COCKPIT-PR57.md).
