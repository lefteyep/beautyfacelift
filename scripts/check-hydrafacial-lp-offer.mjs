import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/hydrafacial-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  landingPage: new URL('../src/layouts/LandingPage.astro', import.meta.url),
  marketingConsent: new URL('../src/components/MarketingConsent.astro', import.meta.url),
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

const [lp, termin, landingPage, marketingConsent, tracking] = await Promise.all([
  readNamedFile('lp'),
  readNamedFile('termin'),
  readNamedFile('landingPage'),
  readNamedFile('marketingConsent'),
  readNamedFile('tracking'),
]);

assert(lp.includes('const PROMO_PRICE = 170'), 'Hydrafacial LP must define CHF 170 promo price');
assert(lp.includes('const REGULAR_PRICE = 250'), 'Hydrafacial LP must define CHF 250 regular price');
assert(lp.includes('const DURATION_LABEL = \'1 Std. 30 Min.\''), 'Hydrafacial LP must show the requested duration label');
assert(lp.includes('Hydrafacial + Microneedling'), 'Hydrafacial LP must name the treatment clearly');
assert(lp.includes('CHF {PROMO_PRICE}') || lp.includes('CHF ${PROMO_PRICE}'), 'Hydrafacial LP must render the promo price');
assert(lp.includes('statt CHF {REGULAR_PRICE}') || lp.includes('statt CHF ${REGULAR_PRICE}'), 'Hydrafacial LP must render the original price anchor');
assert(lp.includes('Kombi-Termin sichern'), 'Hydrafacial LP must use one consistent primary CTA');
assert(!lp.includes('Mehr erfahren'), 'Hydrafacial LP hero must not show a competing secondary CTA');
assert(
  lp.includes('HydraFacial + Microneedling in Zürich für frischere, glatter wirkende Haut'),
  'Hydrafacial LP must use the approved outcome-led hero headline',
);
assert(lp.includes('Wenn die Haut müde, unruhig oder fahl wirkt'), 'Hydrafacial LP must connect visitor desire to the offer');
assert(lp.includes('Warum diese Kombination?'), 'Hydrafacial LP must explain why Hydrafacial and Microneedling are combined');
assert(lp.includes('Was passiert in 90 Minuten?'), 'Hydrafacial LP must combine included items and treatment steps into one clear section');
assert(lp.includes('Vertrauen vor der Buchung'), 'Hydrafacial LP must include a stronger trust/proof section before the final booking area');
assert(lp.includes('Realistische Ergebnisse statt übertriebener Versprechen'), 'Hydrafacial LP must keep expectation-setting visible');
assert(lp.includes('Wie viele Sitzungen sind sinnvoll?'), 'Hydrafacial LP FAQ must address session expectations');
assert(lp.includes('Wann sollte ich die Behandlung verschieben?'), 'Hydrafacial LP FAQ must address suitability and safety objections');
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
assert(
  marketingConsent.includes('bfl-consent-visible') && marketingConsent.includes('bfl-consent-hidden'),
  'Marketing consent must expose visible/hidden state so mobile sticky CTAs do not fight the banner',
);

assert(tracking.includes("'/lp/hydrafacial-microneedling/'"), 'Tracking must register the Hydrafacial campaign route');
assert(tracking.includes("content_name: 'Hydrafacial Microneedling Aktion'"), 'Tracking must name the Hydrafacial ViewContent event');
assert(tracking.includes('value: 170'), 'Tracking must send CHF 170 as the ViewContent value');
assert(!tracking.includes("'/lp/hydra4face-microneedling/'"), 'Tracking must not keep the old hydra4face campaign route');

console.log('[ok] Hydrafacial + Microneedling LP offer, metadata, bridge, and tracking are aligned.');
