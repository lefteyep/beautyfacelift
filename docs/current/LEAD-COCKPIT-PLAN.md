# Lead-Cockpit — current scope and rollout gates

**Updated 21 October 2026 after the project/code review.** The focused review repair milestone is **IMPLEMENTED AND LOCALLY VERIFIED ACROSS REPAIR BRANCHES**; see [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md). Authentication choice/setup, retention implementation and new features are outside that repair. Phase 2 is held.

The exact implementation plan approved on 20 October is preserved in [the archived plan](../archive/reviews/2026-10-21-pre-repair/LEAD-COCKPIT-PLAN.md). Its architecture/schema/PR breakdown explain the existing branches, but its rollout order, pricing assumptions and deferred privacy/retention work are not current release instructions.

## Business goal and current state

The user subsequently instructed the local coordinator to complete technical preparation autonomously. The bounded initial scope is now the agency list/contact/manual appointment-outcome workflow plus necessary telephone/WhatsApp entry and missing-enquiry recovery. [The pilot record](COCKPIT-PILOT-2026-10-21.md) contains the implementation, safe-off defaults and current verification. #59/#60 are deployed and #61 is merged into the unreleased cockpit stack; the reviewed-source table below remains baseline history. Authentication activation, policy approval, real-data procedures and production release remain separate decisions; Phase 2 remains held.

The agency needs to know which enquiries were contacted, which became appointments and what happened afterwards. Production already delivers enquiry emails through Resend and forwards bookings to Treatwell. The cockpit is a staff workflow, not a technical dependency of public forms or advertising delivery. The user's separate decision remains binding: the campaign waits for cockpit Phase 1.

The campaign plan estimates 16–27 leads in the first CHF 400 month; these are assumptions, not observed demand. Recommended minimum for the next scope review: capture/list enquiries, contact/status updates and manual booked/outcome recording. Evaluate actual use before adding automation. This recommendation does not authorize new features.

| Revision | Existing implementation | Deployment state |
| --- | --- | --- |
| Production `35af1f0` | Astro static site, Worker contact/tracking routes, Resend owner email, Treatwell bridge | Reviewed production source; #58 deployment reported success |
| #55 `codex/leads-ingest` | D1 lead row/event before owner email; migration/configuration | Unmerged; repair/data-readiness gates remain |
| #56 `codex/leads-cockpit`, stacked on #55 | Server-rendered staff list/detail/actions; Access JWT guard and CSRF | Unmerged; no auth provider/setup decision made in this repair |
| #57 `codex/leads-mails-phase1`, stacked on #56 | Confirmation code, reminders and scheduled handler | Unmerged; R1/R8 need verification; customer emails must stay off |

A D1 error is intentionally logged while the owner email continues. An accepted email can therefore have no cockpit row. The tracker is not automatically the complete source of truth. Owner email failure can also leave a stored row while the form reports failure; reconciliation must distinguish receipt, persistence and delivery outcomes.

## Release sequence now required

1. Repair and verify R1–R11, preserving the current public stack and avoiding new automation features. Record checks against the combined revision, including assertion-failure calibration.
2. Review the minimum useful workflow and ownership with the user.
3. Before first D1 persistence, satisfy the disclosure, retention/deletion, failure alerting, reconciliation/recovery and rollout checks in [the repair record](REPAIR-2026-10-21.md#gates-before-the-first-d1-rollout). Their implementation cannot be left until Phase 2. No retention duration is adopted by this document.
4. Staff authentication has now been selected by the user: existing Cloudflare account login through Access. Complete separately approved account setup and prepare configuration/secrets and an agency-only rollout for explicit merge/deploy approval. Existing stacked PRs are not automatically release-ready after a code repair.
5. Test the agency workflow with fixtures and approved test data before separately preparing Teresa/customer go-live. Keep `LEADS_CUSTOMER_MAILS` off, reminders agency-only, no cockpit link in owner emails, and no test email to Teresa until an explicit tested go-live decision.
6. Only after the preserved cockpit gate and external campaign gates are resolved may the user approve campaign activation. Treatwell CHF 170 service, old-site 301 redirect/email preservation, aligned dates and approved funnel checks remain required.

## Authentication — existing Cloudflare account login selected

Staff contact data requires authentication and authorization. The current #56 implementation verifies Cloudflare Access JWT signature, issuer, audience, time bounds and an email allow-list; missing configuration denies access. Access is a managed option inside the Zero Trust product family. The public website, contact route, tracking route and D1 do not require activating the wider suite, WARP or a VPN.

The repair itself did not choose a provider. In subsequent local coordination, the user explicitly selected **existing Cloudflare account login**, then approved the Free plan and personally completed checkout on 21 October. The dashboard confirms active **Zero Trust Free ($0/month)** and team domain `mediapaulo.cloudflareaccess.com`. The user subsequently chose **draft only** for the concrete cockpit Access configuration. The [current readiness record](COCKPIT-ACCESS-READINESS.md) preserves the member-restricted Cloudflare provider and exact agency/1h application-policy proposal; no Cloudflare object was saved and no live login test was run. Actual authentication and production deployment remain gates, requiring a changed user decision. Preserve the legacy PIN provider; no cockpit OTP fallback, membership expansion, paid upgrade or unlimited spending authority follows from enrollment.

A custom Resend email-code login is not a small change to `access.ts`: it needs issuance, abuse throttling, expiry and replay protection, secure session cookies, logout/revocation, operational recovery and regression tests. Compare that ownership cost after the workflow review. Do not begin either setup incidentally.

## Data before rollout

D1 stores contact details, free text/skin goals and attribution, with appointment/revenue/notes data when the staff workflow uses them. Review the public disclosure before that processing starts. Agree a retention period, owner and tested deletion/anonymisation procedure, including related events and recovery/backups. The archived plan's 24-month period was proposed and is not implemented or approved by this repair.

Define a monitored alert route and responsible agency owner for failed inserts/storage outages. Define a comparison of accepted notification emails and stored leads, plus a secure manual recovery path/audit note and a separate way to record WhatsApp enquiries. Logging alone does not establish alerting, and a future manual-entry screen does not solve the current readiness requirement.

## Phase 2 — held

The archived plan records inbound mail capture/Email Routing, Treatwell parsing, automated follow-ups/reviews, unsubscribe, newsletter consent/audiences and extended reporting/export. None is authorized by this repair. Revisit only after the minimal workflow is used and the user agrees to the added maintenance/data-processing scope.

Email Routing must not replace the apex MX without confirming existing all-inkl mailbox use; any future change must preserve working mail. Treatwell has no documented API in this project; parsing notification mail requires real anonymised fixtures and handling uncertain matches. Legacy Supabase restore/delete remains a separate decision; do not change it incidentally.

## Verification and release authority

Follow [AGENTS.md](../../AGENTS.md), the repair validation record and the applicable #55–#57 harnesses. Stub external requests and use local D1/fixtures. A historical passing run, a successful static build or this document does not approve production migration, customer email or a campaign write. No live contact/lead submissions without explicit labelled-test authorization. A reviewed PR and explicit current-conversation merge/deploy approval are still required.
