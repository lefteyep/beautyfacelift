import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function read(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

const failures = [];

function expectIncludes(path, needle, message) {
  if (!read(path).includes(needle)) failures.push(`${path}: ${message}`);
}

function expectNotIncludes(path, needle, message) {
  if (read(path).includes(needle)) failures.push(`${path}: ${message}`);
}

expectIncludes(
  'shared/site.ts',
  "CANONICAL_HOST = 'beautyfacelift-zuerich.ch'",
  'marketing must use the live beautyfacelift-zuerich.ch canonical host.',
);
expectIncludes(
  'shared/site.ts',
  "TREATWELL_BOOKING_URL = 'https://buchung.treatwell.ch/ort/beauty-face-lift/'",
  'shared Treatwell booking destination must stay explicit.',
);
expectIncludes(
  'shared/site.ts',
  "return `/termin/?${params.toString()}`;",
  'service-specific booking links must go through /termin/ so attribution can be forwarded.',
);

expectIncludes(
  'src/pages/termin/index.astro',
  'noindex={true}',
  '/termin/ must remain a noindex booking-forward bridge.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'bookingForwardKeys',
  '/termin/ must forward campaign, click, service, offer, and price parameters.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'bfl_utm',
  '/termin/ must recover persisted UTM/click parameters from sessionStorage.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  "event_name: 'TreatwellOutboundClick'",
  '/termin/ must emit the Treatwell outbound proxy conversion before redirecting.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'window.location.replace(href)',
  '/termin/ must continue users to Treatwell automatically.',
);

expectIncludes(
  'src/layouts/Base.astro',
  "import { initPpcTracking } from '../lib/track';",
  'main site layout must initialize PPC tracking.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  "import { initPpcTracking } from '../lib/track';",
  'ad landing page layout must initialize PPC tracking.',
);
expectIncludes(
  'src/layouts/Base.astro',
  'PUBLIC_META_PIXEL_ID',
  'main layout must support browser Meta Pixel when configured.',
);
expectIncludes(
  'src/layouts/Base.astro',
  'PUBLIC_GTM_ID',
  'main layout must support GTM when configured.',
);

for (const needle of [
  'booking_button_click',
  'treatwell_outbound_click',
  'high_intent_visit',
  'BookingButtonClick',
  'TreatwellOutboundClick',
  'HighIntentVisit',
]) {
  expectIncludes('src/lib/track.ts', needle, `tracking helper must include ${needle}.`);
}
expectIncludes(
  'src/lib/track.ts',
  "content_name: 'Carbon Microneedling Glow-Up Aktion'",
  'Carbon ad LP must keep named ViewContent tracking for campaign diagnostics.',
);

expectIncludes(
  'worker/routes/track.ts',
  'graph.facebook.com/v25.0',
  'Meta CAPI endpoint should use the current launch Graph API version.',
);
expectIncludes(
  'worker/routes/track.ts',
  'ALLOWED_SOURCE_HOSTS',
  'tracking endpoint must validate source hosts.',
);
expectIncludes(
  'worker/routes/track.ts',
  'TREATWELL_BOOKING_URL',
  'tracking endpoint must validate Treatwell outbound destinations.',
);
expectIncludes(
  'worker/routes/track.ts',
  "'TreatwellOutboundClick'",
  'tracking endpoint must allow the Treatwell proxy conversion.',
);

expectIncludes(
  '.env.example',
  'PUBLIC_META_PIXEL_ID=',
  'env example must include the build-time browser Pixel ID.',
);
expectIncludes(
  '.dev.vars.example',
  'PUBLIC_GTM_ID=',
  'wrangler dev vars example must include optional GTM ID.',
);

const docsToCheck = [
  'docs/ARCHITECTURE.md',
  'docs/RELAUNCH-IMPROVEMENTS-PLAN.md',
  'docs/RELAUNCH-STATUS.md',
  'docs/RELEASE-2026-05-08-live-update.md',
  'docs/STATUS.md',
  'docs/superpowers/plans/2026-04-17-carbon-microneedling-lp-revision.md',
];

const staleClaims = [
  'Route booking flow to Aesthetika',
  'Aesthetika booking copy',
  'Removed Treatwell as a first-party booking / identity destination',
  'Remove Treatwell from schema `sameAs` usage and from primary linked action paths',
  'Browser loads /termin/ (static HTML + React island)',
  'BookingWidget mounts',
  "dataLayer.push({ event: 'booking_complete'",
  'Booking | /termin/ | Done — H1, address, booking widget',
  'Preserve tracking & BookingWidget',
  '`#buchen` anchor still scrolls to BookingWidget',
  'BookingWidget auto-advances past treatment selection',
  '`window.__bflTrackLead` still exposed',
];

for (const doc of docsToCheck) {
  for (const claim of staleClaims) {
    expectNotIncludes(doc, claim, `stale marketing/booking claim remains: ${claim}`);
  }
}

expectIncludes(
  'docs/PPC-TRACKING-SETUP-2026-05-08.md',
  'optimize for `BFL - Treatwell Outbound Click`',
  'PPC docs must keep the proxy-conversion optimization guidance.',
);

if (failures.length > 0) {
  console.error('Marketing/ads check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[ok] marketing/ads tracking contract is current');
