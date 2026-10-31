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

function expectFile(path, message) {
  try {
    read(path);
  } catch {
    failures.push(`${path}: ${message}`);
  }
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
  "postCapi('TreatwellOutboundClick'",
  '/termin/ must emit the Treatwell outbound proxy conversion before redirecting.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  "window.fbq('track', 'Schedule'",
  '/termin/ must also emit Meta Schedule for Ads Manager custom-conversion compatibility.',
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
expectFile(
  'src/components/MarketingConsent.astro',
  'marketing consent component must exist before paid Meta traffic.',
);
expectIncludes(
  'src/layouts/Base.astro',
  "import MarketingConsent from '../components/MarketingConsent.astro';",
  'main layout must render the marketing consent component.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  "import MarketingConsent from '../components/MarketingConsent.astro';",
  'ad landing page layout must render the marketing consent component.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  '/impressum/',
  'landing page layout must expose an Impressum link for paid traffic.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  '/datenschutz/',
  'landing page layout must expose a Datenschutz link for paid traffic.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  '/kontakt/',
  'landing page layout must expose a Kontakt link for paid traffic.',
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
expectNotIncludes(
  'src/layouts/Base.astro',
  'connect.facebook.net/en_US/fbevents.js',
  'main layout must not load Meta Pixel before marketing consent.',
);
expectNotIncludes(
  'src/layouts/LandingPage.astro',
  'connect.facebook.net/en_US/fbevents.js',
  'ad landing page layout must not load Meta Pixel before marketing consent.',
);
expectNotIncludes(
  'src/layouts/Base.astro',
  'googletagmanager.com/gtm.js',
  'main layout must not load GTM before marketing consent.',
);
expectNotIncludes(
  'src/layouts/LandingPage.astro',
  'googletagmanager.com/gtm.js',
  'ad landing page layout must not load GTM before marketing consent.',
);
expectIncludes(
  'src/lib/track.ts',
  'hasMarketingConsent',
  'tracking helper must gate marketing events behind explicit consent.',
);
expectIncludes(
  'src/lib/track.ts',
  'bfl_marketing_consent',
  'tracking helper must read the stored marketing consent decision.',
);
expectIncludes(
  'src/lib/track.ts',
  'bfl:marketing-consent-granted',
  'tracking helper must start marketing events after consent is granted.',
);
expectIncludes(
  'src/lib/track.ts',
  "window.fbq?.('track', 'PageView'",
  'PageView browser event must be explicitly sent with a deduplication eventID.',
);
expectIncludes(
  'src/lib/track.ts',
  "event_name: 'PageView'",
  'PageView CAPI event must be sent for browser/CAPI event coverage.',
);
expectIncludes(
  'src/lib/track.ts',
  'test_event_code: getMetaTestEventCode()',
  'tracking helper must pass Meta test_event_code to CAPI for Events Manager troubleshooting.',
);
expectIncludes(
  'src/lib/track.ts',
  'ensureMetaClickIdCookie',
  'tracking helper must recover Meta fbc from fbclid after marketing consent.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'hasMarketingConsent',
  '/termin/ must gate TreatwellOutboundClick tracking behind marketing consent.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'ensureMetaClickIdCookie',
  '/termin/ must recover Meta fbc from fbclid before sending booking-intent CAPI events.',
);
expectIncludes(
  'src/pages/termin/index.astro',
  'test_event_code: getMetaTestEventCode()',
  '/termin/ must pass Meta test_event_code to booking-intent CAPI events during Events Manager tests.',
);
expectIncludes(
  '.github/workflows/deploy.yml',
  'PUBLIC_META_PIXEL_ID',
  'GitHub deploy build must receive the public Meta Pixel ID.',
);
expectIncludes(
  'src/layouts/Base.astro',
  'facebook-domain-verification',
  'main layout must expose the Meta domain verification tag.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  'facebook-domain-verification',
  'landing page layout must expose the Meta domain verification tag.',
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
  "content_name: 'Carbon Microneedling Aktion'",
  'Carbon ad LP must keep named ViewContent tracking for campaign diagnostics.',
);
// Carbon campaign goal is a booking: the primary CTAs go through /termin/ (BookingButtonClick, then
// TreatwellOutboundClick on the bridge); the form links keep *_lead.
for (const location of ['lp_hero_booking', 'offer_section_booking', 'trust_section_booking', 'lp_final_booking', 'sticky_booking', 'form_success_booking']) {
  expectIncludes(
    'src/pages/lp/carbon-microneedling/index.astro',
    `data-treatment={BOOKING_SERVICE} data-button-location="${location}"`,
    `Carbon ad LP booking CTA ${location} must keep its analytics attributes.`,
  );
}
for (const location of ['lp_hero_lead', 'offer_section_lead', 'trust_section_lead', 'lp_final_lead']) {
  expectIncludes(
    'src/pages/lp/carbon-microneedling/index.astro',
    `data-treatment={BOOKING_SERVICE} data-button-location="${location}" data-lead-cta>`,
    `Carbon ad LP form link ${location} must keep its analytics attributes.`,
  );
}
expectIncludes(
  'src/lib/track.ts',
  "url.pathname.startsWith('/termin/')",
  'Booking-bridge links must count as booking clicks (BookingButtonClick).',
);
expectIncludes(
  'src/pages/lp/carbon-microneedling/index.astro',
  'Was die Behandlung bewirken kann',
  'Carbon ad LP must use neutral treatment-goal framing instead of personal-attribute framing.',
);
expectNotIncludes(
  'src/pages/lp/carbon-microneedling/index.astro',
  'Kommt Ihnen das bekannt vor?',
  'Carbon ad LP must avoid direct personal-attribute problem framing.',
);
expectNotIncludes(
  'src/pages/lp/carbon-microneedling/index.astro',
  'Vergrösserte Poren',
  'Carbon ad LP must avoid personal-attribute phrasing in problem cards.',
);
expectNotIncludes(
  'src/pages/lp/carbon-microneedling/index.astro',
  'Pflege ohne Effekt',
  'Carbon ad LP must avoid negative self-perception phrasing in problem cards.',
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
  'worker/routes/track.ts',
  "'Schedule'",
  'tracking endpoint must allow the standard Meta Schedule proxy event.',
);
expectIncludes(
  'worker/routes/track.ts',
  '{1,512}',
  'tracking endpoint must allow full-length Meta click/browser IDs in user_data.',
);
expectIncludes(
  'worker/routes/track.ts',
  'validateTestEventCode',
  'tracking endpoint must validate Meta test_event_code before forwarding to Graph.',
);
expectIncludes(
  'worker/routes/track.ts',
  'test_event_code: testEventCode',
  'tracking endpoint must forward Meta test_event_code to the Conversions API payload.',
);
// The page filters event data and the Worker rejects unknown keys: both must use the one shared
// list, or ad visits (utm_* keys) lose every server event (that was the case until 2026-10-20).
expectIncludes(
  'worker/routes/track.ts',
  'const ALLOWED_EVENT_DATA_KEYS = new Set<string>(CAPI_EVENT_DATA_KEYS);',
  'tracking endpoint must build its event_data allow-list from shared/tracking.ts.',
);
expectIncludes(
  'src/lib/track.ts',
  "from '../../shared/tracking'",
  'browser tracking must take CAMPAIGN_KEYS and the CAPI event-data keys from shared/tracking.ts.',
);
expectIncludes(
  'shared/tracking.ts',
  "'utm_content',",
  'shared event-data keys must include the UTM attribution keys the ad pages attach to every event.',
);
expectNotIncludes(
  'worker/routes/track.ts',
  "'percent_scrolled',\n]);",
  'tracking endpoint must not keep a local copy of the event-data allow-list.',
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
  'docs/current/ARCHITECTURE.md',
  'docs/archive/feature-notes/RELAUNCH-IMPROVEMENTS-PLAN.md',
  'docs/archive/feature-notes/RELAUNCH-STATUS.md',
  'docs/archive/releases/RELEASE-2026-05-08-live-update.md',
  'docs/current/STATUS.md',
  'docs/archive/plans/2026-04-17-carbon-microneedling-lp-revision.md',
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
  'docs/current/PPC-TRACKING.md',
  'Preserve standard Pixel `Lead` optimisation',
  'PPC docs must preserve the approved combo-campaign Lead optimisation guidance.',
);

if (failures.length > 0) {
  console.error('Marketing/ads check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[ok] marketing/ads tracking contract is current');
