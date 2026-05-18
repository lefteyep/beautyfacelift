import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/carbon-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  site: new URL('../shared/site.ts', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
};

const [lp, termin, site, tracking] = await Promise.all(
  Object.values(files).map((file) => readFile(file, 'utf8')),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(lp.includes('const PROMO_PRICE = 169'), 'Carbon LP must define CHF 169 promo price');
assert(lp.includes('const REGULAR_PRICE = 220'), 'Carbon LP must define CHF 220 regular price');
assert(lp.includes('Glow-Up Aktion'), 'Carbon LP must frame the offer as Glow-Up Aktion');
assert(lp.includes('Termin für CHF 169 sichern'), 'Carbon LP must use the promo CTA text');
assert(lp.includes('statt CHF 220'), 'Carbon LP must show the CHF 220 anchor price');
assert(lp.includes('Sie sparen CHF 51'), 'Carbon LP must show the CHF 51 saving');
assert(lp.includes('oldPrice={REGULAR_PRICE}'), 'Offer boxes and sticky bar must receive the old price');
assert(!lp.includes('CHF 250'), 'Carbon LP must not mention CHF 250');
assert(!lp.includes('Offizieller Preis'), 'Carbon LP must not frame the promo as an official price');
assert(
  lp.includes('Hallo Teresa, ich interessiere mich für die Glow-Up Aktion: Carbon Peeling + Microneedling für CHF 169 statt CHF 220.'),
  'WhatsApp prefill must use the promo offer',
);

assert(termin.includes('TREATWELL_BOOKING_URL'), 'Booking bridge must use the Treatwell booking URL constant');
assert(termin.includes('Treatwell'), 'Booking bridge must mention Treatwell');
assert(termin.includes('booking-forward-offer'), 'Booking bridge must expose promo context to users');
assert(termin.includes('glow-up-aktion'), 'Booking bridge must recognize the Glow-Up Aktion offer parameter');
assert(!termin.includes('Aesthetika'), 'Booking bridge must not mention Aesthetika');
assert(site.includes("TREATWELL_BOOKING_URL = 'https://buchung.treatwell.ch/ort/beauty-face-lift/'"), 'Shared booking target must be Treatwell');
assert(site.includes("'offer', 'price'"), 'Shared booking bridge must forward offer and price parameters');

assert(tracking.includes("content_name: 'Carbon Microneedling Glow-Up Aktion'"), 'Tracking must name the promo ViewContent event');
assert(tracking.includes('value: 169'), 'Tracking must send CHF 169 as the ViewContent value');
assert(tracking.includes("metaEventName: 'ViewContent'"), 'Tracking must fire Meta ViewContent');

console.log('[ok] Carbon Microneedling LP offer, Treatwell bridge, and tracking copy are aligned.');
