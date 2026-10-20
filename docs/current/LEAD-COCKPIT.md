# Lead cockpit — runbook

The lead cockpit is a small, server-rendered tool inside the Worker for working through enquiries: who asked, who has been contacted, who booked, who came. It reads and writes the D1 database `beautyfacelift-leads`, where every enquiry from `/api/contact` is stored before the owner e-mail goes out (see `worker/leads/ingest.ts`).

- **URL:** `https://beautyfacelift-zuerich.ch/admin/leads/`
- **Code:** `worker/leads/` — `access.ts` (Access JWT), `csrf.ts`, `time.ts` (Zurich time, ISO week, opening hours), `html.ts` (layout, escaping, inline CSS), `views/list.ts`, `views/detail.ts`, `router.ts`; SQL only in `db.ts`.
- **No JavaScript:** plain HTML pages, plain links and POST forms.
- **Automatic e-mails and Cron:** `worker/email/` (sender, layout, templates) and `worker/cron/automations.ts`; see below.

## Who can log in

Everything under `/admin/` is protected twice:

1. **Cloudflare Access** (Zero Trust) in front of `beautyfacelift-zuerich.ch/admin`. Login method: **One-time PIN** by e-mail only. The policy allows exactly the addresses listed in it.
2. **The Worker** verifies the Access JWT itself on every `/admin/*` request (`worker/leads/access.ts`): signature (RS256) against `${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs` (keys cached 1 h, refetched on an unknown `kid` at most once a minute; after a failed fetch every request is denied without refetching for 60 s), `iss`, `aud`, `exp` and `nbf` (60 s clock leeway), and `email` in `ACCESS_ALLOWED_EMAILS`. The header `Cf-Access-Authenticated-User-Email` is never trusted on its own. Denials are logged as `Access denied for /admin/: <reason>`, except requests without any token (bots, the security smoke). Encoded or doubled spellings of the path (`/%61dmin/`, `//admin/`) are guarded too.

Anything else gets a 401 page "Nicht angemeldet." with a "Erneut anmelden" button (no automatic redirect). The legacy static pages under `/admin/` (`/admin/`, `/admin/design-system/`) are behind the same guard.

Today only the agency address is allowed (policy and `ACCESS_ALLOWED_EMAILS`).

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

### Dashboard steps (Zero Trust)

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
- **Skipped when** (in this order): the switch is off; the lead has no valid e-mail; the lead is marked test/spam; it was already sent; another lead with the same address got one in the last 24 h; more than 20 confirmations went out in the last 60 minutes. The last two protect strangers' inboxes from bot posts on the ad pages, which accept posts without Turnstile.
- **At most once:** `confirmation_sent_at` is claimed with a conditional `UPDATE … WHERE confirmation_sent_at IS NULL` before sending; a successful send writes a `mail_sent` event (kind `confirmation`, Resend id). A failed send gives the claim back and writes `mail_failed`; there is no retry.
- **Variants** (`worker/email/templates/confirmation.ts`): contact page ("Ihre Anfrage bei Beauty Face Lift"), Aquafacial ad page ("Ihre Aquafacial-Anfrage bei Beauty Face Lift"), Aquafacial + Microneedling ad page ("Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift"; adds "Das Angebot gilt bis …" from `CAMPAIGN_OFFERS` while the date has not passed). Content: thanks, "Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages, per …", WhatsApp and phone for questions, the button "Termin online buchen" (absolute `/termin/` link, with the ad page's service), the address, the signature with opening hours, and the line "Diese E-Mail bestätigt den Eingang Ihrer Anfrage." No opt-out link (the mail answers the customer's own request) and no cockpit link.

### Reminder to the studio ("nudge")

- **When:** a lead is still `neu`, not marked test/spam and was not reminded yet, and arrived at least `NUDGE_AFTER_MINUTES` (60) minutes ago. Only within opening hours (`OPENING_HOURS_WEEKLY`, Zurich time): the first run after opening catches up on the leads that arrived while the studio was closed. At most 20 per run, oldest first.
- **Recipient:** `LEADS_NUDGE_TO` only (`wrangler.jsonc`: the agency address until go-live). Reply-to is the same address. Missing → nothing is sent and the run logs "LEADS_NUDGE_TO is missing".
- **Content** (`worker/email/templates/nudge.ts`): subject "Noch offen: Anfrage von {Name} (seit {n} Min.)"; source, treatment/topic, arrival time, phone, e-mail, preferred contact and time, the message (up to 300 characters); buttons "Anrufen" (`tel:`), "WhatsApp" (`wa.me` with the prefilled greeting) and "Im Lead-Cockpit öffnen".
- **At most once:** `nudge_sent_at` is claimed before sending; success writes a `nudge_sent` event (meta names the variable, never the address). A failed send gives the claim back and writes `mail_failed` (kind `nudge`); the lead is retried no earlier than **2 h** later (the back-off reads that event; there is no extra column).

## Cron

- **Schedule:** `*/15 * * * *` (`triggers.crons` in `wrangler.jsonc`). The `scheduled` handler in `worker/index.ts` runs `runAutomations(env, scheduledTime)` (`worker/cron/automations.ts`) through `ctx.waitUntil`; errors are logged as "Lead automations failed:", a run that sent or failed something logs one summary line (counts only).
- **Local test:** with `.dev.vars` containing `RESEND_API_KEY=invalid` and `LEADS_NUDGE_TO=agency@example.test` (never a real address), run `npm run d1:migrate:local`, `npm run build && npx wrangler dev --test-scheduled --port 8787`, then:
  ```
  curl "http://127.0.0.1:8787/__scheduled?cron=*/15+*+*+*+*"
  ```
  With an invalid key the send fails harmlessly and a `mail_failed` event appears in the local D1. The run only does something within opening hours (Zurich time) and for leads older than 60 minutes.

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
- `npm run harness:leads-cron` — the reminder (61 minutes at Tue 11:00 → one mail, overlapping and repeated runs → none, Sunday none, Monday 10:00 CET sent, excluded never, Resend 500 → claim released + 2 h back-off, missing config), the customer confirmation (off by default, sent once when on, 24 h same-address and 60-minute rate limits, failure path, offer date), and both entry points of `worker/index.ts` (`scheduled`, `POST /api/contact`).
- `npm run qa:leads` — source checks (fonts, Access/CSRF wiring, config, docs, Swiss spelling, mail copy without "CHF", the `LEADS_CUSTOMER_MAILS` switch).
- `npm run smoke:security` — `/admin/` and `/admin/leads/` must answer 302 to `*.cloudflareaccess.com` or 401/403, never 200.

The harnesses stub `globalThis.fetch`; they never call Cloudflare or Resend and never send e-mail.

## Security model

- Identity: the Worker verifies the Access JWT itself (see above); no session of its own, no passwords.
- CSRF: every POST must come from the same origin (`Sec-Fetch-Site: same-origin`, or a matching `Origin` when the header is absent) and carry the hidden `_csrf` = HMAC-SHA256(`LEADS_SIGNING_SECRET`, `csrf:` + e-mail + `:` + JWT `exp`), compared in constant time. Failure → 403 "Ungültige Anfrage."
- Output: every value from the database or the request is HTML-escaped (`esc()` / the `html` template tag in `worker/leads/html.ts`). URLs from enquiries are shown as text, never as links.
- Headers: `/admin/*` responses carry `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` and the site's security headers; pages have `<meta name="robots" content="noindex, nofollow">`.
- No JavaScript, no third-party requests; fonts are served from `/fonts/`.

## Go-live checklist

Steps for opening the cockpit to the studio:

1. Add the studio address to the Access policy (Emails).
2. Add the same address to `ACCESS_ALLOWED_EMAILS` in `wrangler.jsonc` (comma-separated) and ship it through a reviewed PR.
3. Sign in once with that address (One-time PIN) and check that the header reads "Angemeldet als …" and new actions appear as "Teresa" in the timeline.
4. Hand over the short German one-pager for the studio (written at go-live).
5. Run `npm run smoke:security` against production.

Steps for the automatic e-mails (same go-live, all through a reviewed PR):

6. `LEADS_NUDGE_TO` in `wrangler.jsonc` → the studio address (`CONTACT_TO_EMAIL`), and the reminder sent with the agency in BCC (small change in `worker/cron/automations.ts`).
7. `LEADS_CUSTOMER_MAILS` → `on` in `wrangler.jsonc` (check that `CONTACT_FROM_EMAIL` uses the verified sending domain first).
8. Add the cockpit link line to the owner enquiry e-mail (`worker/routes/contact.ts`).
9. Update the go-live rules in `npm run qa:leads` (it asserts the agency recipient and the absent switch until then).
