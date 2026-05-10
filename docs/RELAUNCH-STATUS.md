# Relaunch Status

Last updated: 2026-05-10

## Done

- Moved the main homepage and treatment marketing images into Astro's image pipeline and replaced the large raw-image paths where they were hurting LCP and bandwidth.
- Corrected image priority behavior:
  - homepage now preloads the real hero LCP image
  - the overlapping secondary homepage image no longer competes for priority
  - treatment pages preload only their hero image while supporting imagery stays lazy
- Added explicit responsive `sizes` handling for the homepage hero, treatment heroes, and treatment overview cards.
- Raised the mobile type floor and improved paragraph measure, line-height, and supporting copy sizing across navigation, FAQ, pricing, testimonials, and footer text.
- Refactored the `Behandlungen` navigation item into a real section link plus a separate disclosure control with improved desktop hover/focus behavior, keyboard support, and a collapsed-by-default mobile submenu.
- Hardened the mobile navigation overlay so it is hidden in markup by default and behaves correctly for focus management and scroll locking.
- Added the dedicated `/kontakt/` page and `/kontakt/danke/` success page, then rerouted primary contact links away from `/#contact`.
- Added the Worker-backed `POST /api/contact` endpoint with server-side validation, honeypot rejection, conditional Turnstile verification, simple IP-based rate limiting, Resend email delivery, and redirect-based success handling that still works without client-side JavaScript.
- Updated env examples and policy copy so the new contact flow is documented in the repo.
- Removed the treatment-page marquee from all four treatment detail pages and fixed the shared treatment hero overlay/first-paint behavior in layout and CSS instead of page-level hacks.
- Added a shared treatment-page body hook and verified treatment-page hero contrast and breadcrumb spacing in the shared templates.
- Superseded previous Treatwell cleanup: public booking is intentionally back on Treatwell until the alternative booking system is ready.

## Verified

- `npm run build`
- Homepage output preloads the optimized primary hero image.
- Treatment detail pages no longer render the marquee below the hero.
- Primary contact links now resolve to `/kontakt/`.

## Left To Do

- Set the production contact env vars in Cloudflare before relying on the new form in production:
  - `PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `RESEND_API_KEY`
  - `CONTACT_FROM_EMAIL`
  - `CONTACT_TO_EMAIL` or `OWNER_EMAIL`
- Run a live submission test on production to confirm Turnstile verification, Resend delivery, and redirect success behavior end to end.
- Replace any interim treatment/editorial imagery with stronger final source photography from the `docs/IMAGES.md` brief where better originals become available.
- Upgrade the rate limit from in-memory per Worker instance to a shared store if abuse becomes a practical issue.
- Do a short post-deploy visual pass on real mobile devices for the updated nav overlay, treatment heroes, and contact funnel.
