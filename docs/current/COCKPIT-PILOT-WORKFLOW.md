# Agency cockpit pilot workflow

Prepared 21 October 2026. This is implementation and synthetic-test evidence, not a production rollout approval. The pilot remains agency-only. No real forms, mail, client access or campaign activation are part of this work.

## What the pilot supports

The initial screen lists enquiries with status/search filters and opens each enquiry's contact actions, status, appointment, internal notes and audit history. Staff can record a booked appointment and later set its outcome, including appeared, cancelled or no-show. A Treatwell click is not a confirmed booking; staff must verify the booking before recording it.

The list explicitly says it may be incomplete and requires a comparison with notification emails. Weekly totals and the booking rate are absent. Revenue entry is absent from the initial detail screen; its existing protected endpoint remains for compatibility. No revenue report or new automation was added.

## Ordinary staff use

1. Open `/admin/leads/` through the approved agency login. Missing authentication denies access. Production authentication setup and release approval remain separate gates.
2. Search name, email or telephone before adding a record. The default list shows new, contacted and booked enquiries. «Alle» also shows completed outcomes and entries excluded as test/spam.
3. Open the enquiry. Record a contact attempt using «Jetzt kontaktiert», keep the status current and save only necessary internal notes.
4. When the appointment is independently confirmed, enter its date/time in Zurich time. The checkbox can also set «Gebucht». Record the actual outcome with the status form. Cancellation, no-show and not-reached statuses require a short reason.
5. Mark synthetic records as test and spam as spam. They remain accessible under «Alle»; exclusion does not delete personal data or replace a retention procedure.

## Telephone and WhatsApp enquiries

Use «Anfrage erfassen / wiederherstellen», choose Telefon or WhatsApp, and provide a name and valid telephone number. Email, treatment/topic, message and internal note are optional. The saved received time is the staff entry time; do not treat it as a verified historical contact time. A new enquiry starts as «Neu»; staff then records its actual contact/status/appointment outcome.

The form has a generated hidden UUID. Repeating a submission of the same form opens the existing record without overwriting it or adding an event. A newly opened form gets a new UUID and can represent a separate enquiry from the same contact; it does not automatically merge contacts. Search first and avoid unnecessary duplicates.

Saving creates only the D1 record and its staff audit event. It sends no email, tracking request or background job and does not record marketing permission. The row uses source `manual`; the event records `phone` or `whatsapp`. Sent-mail fields remain empty. The integrated pilot's automation eligibility must exclude manual records; the creation route itself never invokes automation.

## Recovering a missing website enquiry

D1 can fail while the owner notification email succeeds. A stored row can also exist when a notification attempt failed. Therefore compare accepted notifications against stored enquiries, and investigate notification/provider failures separately. Do not infer complete capture from dashboard counts or advertising events.

1. Compare the agency's authorized copy of the notification email with the cockpit by name, contact details, source and received time. Open any existing matching enquiry rather than copying it.
2. If the row is missing, choose «Website-Anfrage wiederherstellen».
3. Copy the original `Anfrage-ID` UUID and complete `Eingang` ISO timestamp, including its timezone, from the notification email. Select the original website source. Add the name, email or telephone and a short note explaining the recovery and comparison. Copy only necessary message/topic data.
4. Save and inspect the opened record. The original UUID becomes the record ID and the received timestamp becomes `created_at`, normalized to UTC. `updated_at` and the created audit event record when staff performed recovery. The event retains the original source/reference and recovery channel. The stored source remains `manual`, which distinguishes staff recovery from a successful original form insert.
5. If that UUID already exists, the existing row is opened unchanged. Simultaneous recoveries create one row/event. A different pasted contact or note never overwrites the existing row.

Recovery requires a real past timestamp with an explicit zone, a valid UUID, an original website source, contact details and a reason. It sends no owner or customer notification and schedules no work. Legacy notification emails without a reference/time cannot be safely correlated by this automatic-ID recovery path. Investigate their contact/time match separately; do not invent a reference or arrival time and call it recovered evidence.

## Protection and enablement

Both form display and submission pass the existing `/admin/*` authentication guard. Every write additionally requires a session-bound CSRF token and same-origin browser provenance. Manual capture requires `LEADS_CAPTURE=on`; absent/off returns 503 for submission and displays an unavailable form. A missing signing secret denies saving too. The list and existing update actions remain readable according to their existing rules.

Only bound prepared statements are used. The lead insert and staff event share one D1 batch transaction; an event failure rolls back the lead. UUID uniqueness handles replay/races without overwrites. Other D1 errors return failure and preserve the form ID for retry via the browser. No migration is needed for this manual feature.

Before any real-data rollout, resolve the approved disclosure, retention/deletion ownership and tested procedure, monitored storage alerting, reconciliation ownership, recovery/backups, staff authentication and explicit deployment approval described in [the repair record](REPAIR-2026-10-21.md). This document does not choose a retention duration or claim that monitoring/configuration exists. Keep customer mail off and Teresa unexposed until the separate approved go-live.

## Verification

Run `node --disable-warning=ExperimentalWarning --import tsx scripts/harness/leads-manual.mts` and the existing `harness:leads-cockpit` command. They use in-memory SQLite behind the D1 API, apply the real migrations and invoke the real Worker entry point. Fetch is blocked; fixtures contain synthetic contacts only.

The manual harness checks authentication/CSRF/capture gates, input validation and escaped re-rendering, ordinary replay, simultaneous recovery, preservation of existing website UUIDs, exact original timestamps/provenance, failed lead/event transaction rollback, safe retry, and absence of external calls/background tasks. The cockpit harness checks the changed initial UI plus existing contact/status/appointment/notes behavior. Local Worker typechecking and `qa:leads` supplement these checks. The coordinator registers the new finite harness in the combined release gate and runs the final combined validation with the deployment-compatible runtime.

Implementation references retrieved on 21 October 2026: [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), [D1 binding and transactional batch documentation](https://developers.cloudflare.com/d1/worker-api/d1-database/), and the latest published `@cloudflare/workers-types` declarations. D1's documented batch transaction rollback is exercised by injected SQLite trigger failures; this is local behavioral evidence, not a live D1 availability or dashboard-readiness claim.
