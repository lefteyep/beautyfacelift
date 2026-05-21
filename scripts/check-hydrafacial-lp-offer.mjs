import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/hydrafacial-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  landingPage: new URL('../src/layouts/LandingPage.astro', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readNamedFile(name) {
  try {
    return await readFile(files[name], 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`${name} file is missing at ${files[name].pathname}`);
    }
    throw error;
  }
}

const [lp, termin, landingPage, tracking] = await Promise.all([
  readNamedFile('lp'),
  readNamedFile('termin'),
  readNamedFile('landingPage'),
  readNamedFile('tracking'),
]);

assert(lp.includes('const PROMO_PRICE = 170'), 'Hydrafacial LP must define CHF 170 promo price');
assert(lp.includes('const REGULAR_PRICE = 250'), 'Hydrafacial LP must define CHF 250 regular price');
assert(lp.includes('const DURATION_LABEL = \'1 Std. 30 Min.\''), 'Hydrafacial LP must show the requested duration label');
assert(lp.includes('Hydrafacial + Microneedling'), 'Hydrafacial LP must name the treatment clearly');
assert(lp.includes('CHF {PROMO_PRICE}') || lp.includes('CHF ${PROMO_PRICE}'), 'Hydrafacial LP must render the promo price');
assert(lp.includes('statt CHF {REGULAR_PRICE}') || lp.includes('statt CHF ${REGULAR_PRICE}'), 'Hydrafacial LP must render the original price anchor');
assert(lp.includes('Jetzt Termin sichern'), 'Hydrafacial LP must use a strong primary CTA');
assert(lp.includes('FAQAccordion items={faqs}'), 'Hydrafacial LP must include the FAQ accordion');
assert(lp.includes('TrustStrip variant="promises"'), 'Hydrafacial LP must include a trust/quality strip');
assert(lp.includes("bookingLinkForService(BOOKING_SERVICE)"), 'Hydrafacial LP must route booking through the existing /termin/ bridge');
assert(lp.includes("data-treatment=\"Hydrafacial + Microneedling\""), 'Hydrafacial LP CTAs must expose the treatment for tracking');
assert(!lp.includes('garantiert'), 'Hydrafacial LP must avoid guaranteed-result claims');
assert(!lp.includes('Hydra4Face') && !lp.includes('hydra4face'), 'Hydrafacial LP must not use the device-brand term');

assert(termin.includes('hydrafacial-microneedling-aktion'), 'Booking bridge must recognize the Hydrafacial campaign offer parameter');
assert(termin.includes('Hydrafacial + Microneedling für CHF 170 statt CHF 250'), 'Booking bridge must expose Hydrafacial promo context to users');
assert(!termin.includes('hydra4face-microneedling-aktion'), 'Booking bridge must not keep the old hydra4face offer parameter');

assert(landingPage.includes('og:title'), 'Landing page layout must expose Open Graph title metadata');
assert(landingPage.includes('twitter:card'), 'Landing page layout must expose Twitter card metadata');

assert(tracking.includes("'/lp/hydrafacial-microneedling/'"), 'Tracking must register the Hydrafacial campaign route');
assert(tracking.includes("content_name: 'Hydrafacial Microneedling Aktion'"), 'Tracking must name the Hydrafacial ViewContent event');
assert(tracking.includes('value: 170'), 'Tracking must send CHF 170 as the ViewContent value');
assert(!tracking.includes("'/lp/hydra4face-microneedling/'"), 'Tracking must not keep the old hydra4face campaign route');

console.log('[ok] Hydrafacial + Microneedling LP offer, metadata, bridge, and tracking are aligned.');
