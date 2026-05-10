import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function read(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

const failures = [];

function expectIncludes(path, needle, message) {
  if (!read(path).includes(needle)) {
    failures.push(`${path}: ${message}`);
  }
}

function expectNotIncludes(path, needle, message) {
  if (read(path).includes(needle)) {
    failures.push(`${path}: ${message}`);
  }
}

expectIncludes(
  'src/layouts/LandingPage.astro',
  "import { installTreatwellBookingClickTracking, trackPageView } from '../lib/track';",
  'ad landing pages must install Treatwell booking-click tracking and direct PageView tracking.',
);
expectIncludes(
  'src/layouts/LandingPage.astro',
  'trackPageView();',
  'ad landing pages must emit a PageView event from the shared layout.',
);
expectIncludes(
  'src/layouts/Base.astro',
  "import { installTreatwellBookingClickTracking } from '../lib/track';",
  'main site pages must install Treatwell booking-click tracking.',
);
expectIncludes(
  'src/lib/track.ts',
  'installTreatwellBookingClickTracking',
  'tracking helper must expose a shared Treatwell booking-click installer.',
);
expectIncludes(
  'src/lib/track.ts',
  "content_name: 'Treatwell booking click'",
  'Treatwell outbound clicks must be labelled clearly as booking-click leads.',
);
expectIncludes(
  'worker/routes/track.ts',
  'graph.facebook.com/v25.0',
  'Meta CAPI endpoint must use the current Graph API version pinned for this launch.',
);
expectNotIncludes(
  'src/pages/lp/carbon-microneedling/index.astro',
  'trackPageView();',
  'carbon LP must not fire a duplicate page view after LandingPage owns PageView tracking.',
);

const docsToCheck = [
  'CLAUDE.md',
  'PRD.md',
  'docs/ARCHITECTURE.md',
  'docs/OPERATIONS-RUNBOOK.md',
  'docs/PENDING-WORK.md',
  'docs/RELAUNCH-IMPROVEMENTS-PLAN.md',
  'docs/RELAUNCH-STATUS.md',
  'docs/SETUP.md',
  'docs/SITEMAP.md',
  'docs/STATUS.md',
  'docs/TODO.md',
  'docs/superpowers/plans/2026-04-17-carbon-microneedling-lp-revision.md',
];

const staleDocClaims = [
  'preserves the existing BookingWidget + Meta Pixel/CAPI tracking',
  'Preserve tracking & BookingWidget',
  '`#buchen` anchor still scrolls to BookingWidget',
  'BookingWidget auto-advances past treatment selection',
  '`window.__bflTrackLead` still exposed',
  'Removed Treatwell as a first-party booking / identity destination',
  'Remove Treatwell from schema `sameAs` usage and from primary linked action paths',
  'Booking widget | Live',
  'Client-side: dataLayer.push({ event: \'booking_complete\'',
  'Browser loads /termin/ (static HTML + React island)',
  '`/termin/` loads booking widget',
  '`/termin/` — booking widget loads',
  '- `/termin/`',
];

for (const doc of docsToCheck) {
  const text = read(doc);
  for (const claim of staleDocClaims) {
    if (text.includes(claim)) {
      failures.push(`${doc}: stale documentation claim: ${claim}`);
    }
  }
}

expectIncludes(
  'docs/SETUP.md',
  'PUBLIC_META_PIXEL_ID',
  'setup docs must distinguish browser Pixel ID from server-side CAPI secrets.',
);
expectIncludes(
  'docs/ARCHITECTURE.md',
  'Treatwell booking click',
  'architecture docs must describe the current Meta ads conversion signal.',
);

if (failures.length > 0) {
  console.error('Meta tracking/documentation check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[ok] meta tracking and documentation are current');
