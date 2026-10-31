import { readFile } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/carbon-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  site: new URL('../shared/site.ts', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
  worker: new URL('../worker/routes/contact.ts', import.meta.url),
};

const [lp, termin, site, tracking, worker] = await Promise.all(
  Object.values(files).map((file) => readFile(file, 'utf8')),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const markup = lp.split('<style>')[0];
const styles = lp.split('<style>')[1] ?? '';

// Offer: CHF 175 statt CHF 250 (agreed with Teresa 2026-10-31), 90 Min., valid until 30 November 2026.
assert(lp.includes('const PROMO_PRICE = 175;'), 'Carbon LP must define the CHF 175 promo price');
assert(lp.includes('const REGULAR_PRICE = 250;'), 'Carbon LP must define the CHF 250 regular price (Treatwell)');
assert(lp.includes("const SAVINGS_LABEL = 'Sie sparen CHF 75.–';"), 'Carbon LP must show the CHF 75 saving');
assert(lp.includes("const DURATION_LABEL = '90 Min.';"), 'Carbon LP must show the Treatwell duration');
assert(lp.includes("const OFFER_LABEL = 'Carbon-Peeling + Microneedling Aktion';"), 'Carbon LP must name the offer «Carbon-Peeling + Microneedling Aktion»');
assert(lp.includes("const OFFER_SLUG = 'carbon-microneedling-aktion';"), 'Carbon LP must use the carbon-microneedling-aktion offer slug');
assert(lp.includes("const BOOKING_SERVICE = 'Carbon Microneedling';"), 'Carbon LP must keep the Carbon Microneedling booking service');
assert(lp.includes('CHF {PROMO_PRICE}.–') && lp.includes('statt CHF {REGULAR_PRICE}.–'), 'Carbon LP hero must show the promo price with the regular price');
assert(lp.includes('{SAVINGS_LABEL}'), 'Carbon LP hero must render the saving');

// A "statt" price must be time-limited (Swiss price-indication rules): one ISO date drives the visible
// end date (hero offer line, FAQ 1, closing band) and the schema's priceValidUntil.
assert(lp.includes("const OFFER_VALID_UNTIL = '2026-11-30';"), 'Carbon LP offer must end on 30 November 2026');
assert(lp.includes("new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })"), 'Carbon LP must render «30. November 2026» from the ISO date');
assert(lp.includes('Angebot gültig bis {OFFER_VALID_UNTIL_LABEL}'), 'Carbon LP must show the offer end date in the hero offer line');
assert(lp.includes('Das Angebot gilt bis ${OFFER_VALID_UNTIL_LABEL}.'), 'Carbon LP must state the offer end date in FAQ 1');
assert(lp.includes('Das Angebot gilt bis {OFFER_VALID_UNTIL_LABEL}.'), 'Carbon LP must state the offer end date in the closing band');
assert(lp.includes('gültig bis ${OFFER_VALID_UNTIL_LABEL}. Jetzt online auf Treatwell buchen.`'), 'Carbon LP meta description must name the offer end date and the booking action');
assert(lp.includes('priceValidUntil: OFFER_VALID_UNTIL'), 'Carbon LP schema must take priceValidUntil from the offer end date');
assert(
  lp.includes("const whatsappMessage = 'Hallo Teresa, ich interessiere mich für die Aktion Carbon-Peeling + Microneedling für CHF 175 statt CHF 250. Passt die Behandlung zu meiner Haut?';"),
  'WhatsApp prefill must use the CHF 175 offer',
);

// The old offer is gone everywhere.
for (const old of ['CHF 220', 'REGULAR_PRICE = 220', 'PROMO_PRICE = 169', 'Glow-Up', 'Sie sparen CHF 51']) {
  assert(!lp.includes(old), `Carbon LP must not keep the old offer (${old})`);
}
assert(!termin.includes('glow-up-aktion'), 'Booking bridge must not keep the old Glow-Up offer branch');

// The campaign's goal is a booking (user, 2026-10-31): every primary CTA goes through the /termin/ bridge
// to Treatwell; the request form is the secondary path; WhatsApp in the closing band and the floating disc.
assert(lp.includes("const BOOKING_CTA_LABEL = 'Jetzt auf Treatwell buchen';"), 'Carbon LP primary CTA must be the Treatwell booking');
assert(lp.includes("const STICKY_CTA_LABEL = 'Jetzt buchen';"), 'Carbon LP must define the short sticky booking label');
assert(lp.includes("const LEAD_CTA_PROMPT = 'Lieber zuerst Fragen klären?';") && lp.includes("const LEAD_CTA_LABEL = 'Unverbindlich anfragen';"), 'Carbon LP must offer the form as the secondary path');
assert(lp.includes("const SUBMIT_LABEL = 'Unverbindlich Termin anfragen';") && lp.includes('<span data-submit-label>{SUBMIT_LABEL}</span>'), 'Carbon LP submit button must carry the request label');
assert(lp.includes("const SECONDARY_CTA_LABEL = 'Per WhatsApp anfragen'"), 'Carbon LP must define the WhatsApp CTA label');
assert(!lp.includes('PRIMARY_CTA_LABEL'), 'Carbon LP must not keep the form-first primary CTA');
const leadLink = (group) => '<p class="lp-cta-alt">{LEAD_CTA_PROMPT} <a href={`#${LEAD_FORM_ID}`} data-treatment={BOOKING_SERVICE} data-button-location="' + group + '_lead" data-lead-cta>{LEAD_CTA_LABEL}</a></p>';
for (const group of ['lp_hero', 'offer_section', 'trust_section', 'lp_final']) {
  const buttonClass = group === 'lp_hero' ? 'btn lp-hero-primary' : 'btn';
  assert(
    lp.includes(`<a href={bookingHref} class="${buttonClass}" data-treatment={BOOKING_SERVICE} data-button-location="${group}_booking">{BOOKING_CTA_LABEL}</a>`),
    `Carbon LP ${group} primary CTA must be the Treatwell booking button through /termin/`,
  );
  assert(lp.includes(leadLink(group)), `Carbon LP ${group} must offer the form as one secondary text link`);
}
assert(lp.includes('<a href={bookingHref} class="btn lp-mobile-sticky-cta" data-treatment={BOOKING_SERVICE} data-button-location="sticky_booking">{STICKY_CTA_LABEL}</a>'), 'Carbon LP sticky bar must carry the booking CTA');
assert((lp.match(/href=\{bookingHref\}/g) || []).length === 6, 'Hero, included, trust, closing band, sticky bar and form success must link to the booking bridge');
assert((lp.match(/data-lead-cta>/g) || []).length === 4, 'Hero, included, trust and closing band must each carry one form link');
assert(lp.includes('data-button-location="form_success_booking">{BOOKING_CTA_LABEL}</a>'), 'Treatwell booking must be offered after a successful request');
assert(lp.includes('Kann ich direkt online buchen?') && lp.includes('Ja, das ist der einfachste Weg'), 'Carbon LP FAQ must recommend booking online on Treatwell');
for (const source of ['carbon_final', 'carbon_floating_whatsapp']) {
  assert(lp.includes(`source="${source}"`), `Carbon LP WhatsApp CTA must carry source ${source}`);
}
assert(!/class="lp-hero-bullets|heroBullets/.test(lp), 'Carbon LP hero is H1, lead, price line and CTAs only (no bullet list)');
assert(lp.includes('data-source="carbon_location"'), 'Carbon LP route link must carry data-source="carbon_location"');
assert(!lp.includes('Termin für CHF'), 'Carbon LP must not keep the booking-first price CTA');
assert(lp.includes('bookingLinkForService(BOOKING_SERVICE)'), 'Carbon LP must route booking through the /termin/ bridge');

// Hero: the LP kicker is the only allowed overline.
assert(
  lp.includes('<p class="eyebrow eyebrow--rule lp-eyebrow">Aktion: Carbon-Peeling + Microneedling in Zürich</p>'),
  'Carbon LP hero eyebrow must use the shared eyebrow style and the action copy',
);
assert(lp.includes('Carbon-Peeling + Microneedling: zwei Behandlungen in einer Sitzung</h1>'), 'Carbon LP must use the approved H1');
assert(lp.includes('loading="eager"') && lp.includes('fetchpriority="high"'), 'Carbon LP must prioritize the hero image');
assert((lp.match(/loading="eager"/g) || []).length === 1, 'Carbon LP must not eagerly load non-hero images');

// Proof: the Treatwell rating line (4,8 from 261 reviews on 2026-10-31) instead of invented testimonials.
assert(lp.includes('4,8</strong> aus 260+ Bewertungen auf Treatwell') && lp.includes('href={TREATWELL_URL}'), 'Carbon LP must show the Treatwell rating line with its source link');
assert(!lp.includes('TestimonialStrip') && !lp.includes('testimonials'), 'Carbon LP must not carry testimonials');
for (const name of ['Laura M.', 'Sandra B.', 'Marina K.']) {
  assert(!lp.includes(name), `Carbon LP must not keep the placeholder testimonial (${name})`);
}
assert(
  lp.includes('Dipl. Visagistin &amp; Kosmetikerin, seit über 20 Jahren im Beruf und selbstständig.'),
  'Carbon LP must use Teresa\'s title from the Treatwell profile and the user\'s 20-year statement',
);
assert(!lp.includes('Spezialisierung auf Microneedling'), 'Carbon LP must not claim an unproven specialisation');
assert(!lp.includes('teresa_portrait'), 'Carbon LP must not show the portrait until its origin is clear');
assert(!lp.includes('carbon_treatment_teresa'), 'Carbon LP must not show the generated image with a Teresa-like face and a laser handpiece');

// What is included: Teresa's list of the steps (2026-10-31) and the user's treatment description.
assert(lp.includes('Das ist inbegriffen'), 'Carbon LP must list what is included');
for (const item of ['Reinigung und Hautanalyse', 'Fruchtsäure-Peeling', 'Carbon-Lotion und Laserbehandlung', 'Diamantabrasion', 'Microneedling, Tiefe passend zu Ihrem Hauttyp', 'Maske', 'LED-Licht', 'Nachsorge-Hinweise für die Tage danach']) {
  assert(lp.includes(`'${item}'`), `Carbon LP included list must name «${item}»`);
}
assert(lp.includes('Dann wird eine Carbon-Lotion aufgetragen und mit dem Laser behandelt.'), 'Carbon LP must name the laser neutrally in the method step');
assert(lp.includes('mit Reinigung, Hautanalyse, Fruchtsäure-Peeling, Carbon-Peeling, Diamantabrasion, Microneedling, Maske, LED-Licht und Nachsorge-Hinweisen.'), "Carbon LP FAQ 1 must list every step of the treatment in Teresa's order");
assert(/'Fruchtsäure-Peeling',\s*'Carbon-Lotion und Laserbehandlung',\s*'Diamantabrasion',\s*'Microneedling/.test(lp), "Carbon LP included list must follow Teresa's order (Fruchtsäure-Peeling, Carbon, Diamantabrasion, Microneedling)");
assert(lp.includes('SPF 30–50') && lp.includes('Retinol-, Säure- oder Peelingprodukte'), 'Carbon LP FAQ must carry the after-care from the treatment description');
assert(
  lp.includes('Nicht bei aktiven Infektionen, entzündeter Akne, gereizter oder verletzter Haut und nicht in der Schwangerschaft.'),
  'Carbon LP FAQ must name the contraindications, pregnancy included',
);

// Claims that stay off the page: Teresa's list (2026-10-31) has no Hyaluron and no numbing cream; the
// mask is named plainly; the rest promise results.
for (const banned of ['Hyaluron', 'Abschlussmaske', 'betäubende', 'Kollagen', 'Narben', 'keine Ausfallzeit', 'Ausfallzeit', 'gesellschaftsfähig', 'garantiert', 'schmerzfrei', 'Aktivkohle', 'Hydra', 'Offizieller Preis']) {
  assert(!lp.includes(banned), `Carbon LP must not say «${banned}»`);
}
assert((markup.match(/Akne/g) || []).length === 1 && markup.includes('entzündeter Akne'), 'Carbon LP may name acne only as a contraindication');
assert(!/<h1[^>]*>[^<]*Laser/.test(lp) && !lp.includes('<title>') && !/title=\{`[^`]*Laser/.test(lp), 'Carbon LP must keep «Laser» out of the headline and the title');

// Lead form: JSON post to the contact API, Turnstile-exempt campaign, Lead only after the server accepted it.
assert(lp.includes("const CONTACT_TOPIC = 'Ich möchte einen Termin buchen';"), 'Carbon LP must post an allowed contact topic');
assert(lp.includes("const CONTACT_CAMPAIGN = 'carbon_microneedling';") && lp.includes('name="campaign" value={CONTACT_CAMPAIGN}'), 'Carbon LP form must post the carbon_microneedling campaign');
assert(lp.includes("const CONTACT_SOURCE = 'carbon-microneedling-lp';") && lp.includes('name="source" value={CONTACT_SOURCE}'), 'Carbon LP form must post source carbon-microneedling-lp');
for (const field of ['topic', 'offer', 'treatment', 'landing_page', 'page_path', 'page_url', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'msclkid']) {
  assert(lp.includes(`<input type="hidden" name="${field}"`), `Carbon LP form must carry the hidden field ${field}`);
}
assert(lp.includes('class="lp-lead-form" action="/api/contact" method="post" data-lead-form novalidate'), 'Carbon LP must submit through the contact API');
assert(lp.includes('name="name" type="text" maxlength="120" autocomplete="name" required'), 'Carbon LP form must require the name');
assert(lp.includes('name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+41 79 000 00 00" required'), 'Carbon LP form must require phone or WhatsApp');
assert(lp.includes('name="privacyConsent"'), 'Carbon LP form must keep privacy consent');
assert(lp.includes('class="lp-honeypot" aria-hidden="true" inert'), 'Carbon LP form must keep the hidden honeypot');
assert(!lp.includes('cf-turnstile'), 'Carbon LP form must not depend on Turnstile rendering');
assert(worker.includes("'carbon_microneedling'") && /TURNSTILE_OPTIONAL_CAMPAIGNS = new Set\(\[[^\]]*'carbon_microneedling'/.test(worker), 'Worker must exempt the carbon_microneedling campaign from Turnstile');
const fetchIndex = lp.indexOf('const response = await fetch(form.action');
const responseOkIndex = lp.indexOf('if (!response.ok)');
const successShownIndex = lp.indexOf('success.hidden = false');
const leadTrackingIndex = lp.indexOf('window.bflTracking?.trackLead?.({');
assert(fetchIndex !== -1 && responseOkIndex > fetchIndex && successShownIndex > responseOkIndex && leadTrackingIndex > successShownIndex, 'Carbon LP must send JSON, check response.ok, show success and only then count the Lead');
assert(lp.includes("source: 'carbon_microneedling_lp_form',\n              value: 175,") || lp.includes("source: 'carbon_microneedling_lp_form',\r\n              value: 175,"), 'Carbon LP Lead must carry its source and the CHF 175 value');
assert(lp.includes("treatment_name: 'Carbon Microneedling'"), 'Carbon LP GA4 CTA event must name the treatment');
assert(lp.includes('Vielen Dank, Ihre Anfrage ist eingegangen.'), 'Carbon LP form must show an inline success state (no exclamation mark)');

// CRO pass (2026-10-31, audit CARBON-LP-CRO-AUDIT-2026-10-31.md): benefit-led hero lead that matches ad text 1,
// goals before steps, no lead over the steps, the form framed as the path for questions, each reassurance once.
assert(
  /Das Carbon-Peeling kann die Haut optisch klären, das Microneedling die natürliche Hauterneuerung\r?\n\s+unterstützen – persönlich von Teresa Stimac an der Bahnhofstrasse&nbsp;94 in Zürich\./.test(lp),
  'Carbon LP hero lead must name the benefit in the cautious «kann …» form (plan 3.3 wording)',
);
assert(!/Erst klärt das Carbon-Peeling/.test(lp), 'Carbon LP hero lead must not state the Carbon-Peeling effect as a fact (orchestrator correction, 2026-10-31)');
assert(lp.indexOf('id="lp-goals-title"') < lp.indexOf('id="lp-steps-title"') && lp.indexOf('id="lp-steps-title"') < lp.indexOf('id="lp-trust-title"'), 'Treatment goals sit between the included list and the steps');
assert(lp.includes('<section class="lp-section lp-section--rule lp-goals"'), 'Goals section carries the hairline, as it follows another cream section');
assert(!lp.includes('Reinigung und Peelings, dann Microneedling, zum Schluss Maske und LED-Licht'), 'Steps section has no lead that repeats the step titles');
assert(lp.includes('<p class="lp-section-lead">Für alle, die vor der Buchung noch eine Frage haben.</p>'), 'Form lead must frame the form as the path for questions before booking');
assert(lp.includes("'Sie senden Ihren Terminwunsch.',") && lp.includes('<p class="lp-form-note">Ohne Online-Zahlung.</p>'), 'Form must state «ohne Online-Zahlung» once, under the submit button (the button already says «Unverbindlich»)');
assert(!lp.includes('Kurz ausfüllen –') && !lp.includes('Keine Online-Zahlung. Das Studio meldet sich'), 'Form must not repeat the follow-up promise three times');
assert(lp.indexOf("q: 'Kann ich direkt online buchen?'") < lp.indexOf("q: 'Kostet die Anfrage über das Formular etwas?'") && lp.indexOf("q: 'Was ist im Angebot enthalten?'") < lp.indexOf("q: 'Kann ich direkt online buchen?'"), 'FAQ order: offer, online booking, then the form question');
assert(lp.includes("a: 'Nein. Die Anfrage ist unverbindlich und ohne Online-Zahlung.',"), 'FAQ form answer stays short (the follow-up promise lives in the online-booking answer)');

// Components: the lead flow replaces the booking widgets.
for (const component of ['OfferBox', 'TrustStrip', 'BookingCta', 'StickyOfferBar']) {
  assert(!lp.includes(component), `Carbon LP must not use ${component}`);
}
assert(lp.includes('data-mobile-sticky inert') && lp.includes('sticky.inert = !visible'), 'Carbon LP sticky bar must start inert and leave the tab order while hidden');
assert(lp.includes('body.lp-sticky-visible:not(.bfl-consent-visible):not(.lp-lead-success)'), 'Carbon LP sticky bar must hide while consent is open and after success');
assert(lp.includes('data-map-embed={googleMapsEmbedUrl}') && !lp.includes('<iframe'), 'Carbon LP map must load only on request');

// Styling and voice: tokens only, no italics, no uppercase labels, no inline styles, "Sie".
assert(!/#[0-9a-f]{3,8}\b/i.test(styles.replace(/url\("data:image\/svg\+xml[^"]*"\)/g, '')), 'Carbon LP styles must use design tokens instead of hard-coded colours');
assert(!/font-style:\s*italic/.test(lp) && !/<em>/.test(markup), 'Carbon LP must not use italics');
assert(!/text-transform:\s*uppercase/.test(lp), 'Carbon LP labels must stay in sentence case');
assert(!/\sstyle=["{]/.test(lp), 'Carbon LP markup must not use inline styles');
assert(!lp.includes('ß'), 'Carbon LP must use Swiss spelling (ss)');
assert(!/\b(du|dich|dir|dein|deine|deinen|deiner)\b/i.test(markup.replace(/^(import|const) .*$/gm, '')), 'Carbon LP must address visitors with "Sie"');
for (const jargon of ['Tracking-Brücke', 'Kampagnenparameter']) {
  assert(!lp.includes(jargon), `Carbon LP must not show tracking jargon (${jargon}) to customers`);
}

// Reviews: verbatim from Treatwell (./_reviews.ts), six in view, the rest behind a button only the script reveals.
const reviews = await readFile(new URL('../src/pages/lp/carbon-microneedling/_reviews.ts', import.meta.url), 'utf8');
const reviewCount = (reviews.match(/^ {4}name: /gm) || []).length;
assert(reviewCount >= 6, `Carbon LP must carry at least six Treatwell reviews (got ${reviewCount})`);
for (const name of ['Svenja', 'Rahel', 'Andreas', 'Klara']) {
  assert(reviews.includes(`name: "${name}"`), `Carbon LP reviews must include ${name}`);
}
assert((reviews.match(/^ {4}date: "\d{4}-\d{2}",\r?$/gm) || []).length === reviewCount, 'Every review must carry its Treatwell month (YYYY-MM)');
const reviewsPerName = {};
for (const [, name] of reviews.matchAll(/^ {4}name: "([^"]+)"/gm)) reviewsPerName[name] = (reviewsPerName[name] || 0) + 1;
const repeated = Object.entries(reviewsPerName).filter(([, count]) => count > 2);
assert(repeated.length === 0, `Carbon LP shows at most two reviews per name (user, 2026-10-31); too many: ${JSON.stringify(repeated)}`);
const brandWord = ['Hyd', 'ra'].join('');
const reviewBans = [brandWord, ['Hyd', 'ro'].join(''), 'CHF', 'Resultat', 'Ergebnis', 'verbesser', 'strahl', 'Poren', 'jünger', 'Falten', 'garantiert', 'Ausfallzeit', 'ß'];
for (const banned of reviewBans) {
  assert(!reviews.toLowerCase().includes(banned.toLowerCase()), `Carbon LP reviews must not contain «${banned}»`);
}
assert(lp.includes("import { TREATWELL_REVIEWS } from './_reviews';") && lp.includes('const REVIEWS_SHOWN = 6;'), 'Carbon LP must render the review data with six in view');
assert(
  lp.includes('const reviewsInView = TREATWELL_REVIEWS.filter((review, index, all) => all.findIndex((other) => other.name === review.name) === index).slice(0, REVIEWS_SHOWN);') && lp.includes('{reviewsToShow.map((review, index) => ('),
  'The six reviews in view carry six different names (display rule in the page, data order in _reviews.ts unchanged)',
);
assert(lp.includes('<h2 id="lp-reviews-title" class="lp-section-title">Bewertungen auf Treatwell</h2>'), 'Carbon LP must title the reviews section plainly');
assert(lp.includes('data-button-location="reviews_treatwell">Bewertung auf Treatwell</a>') && lp.includes('href={TREATWELL_URL}'), 'Every review must link its source on Treatwell');
assert(lp.includes('data-reviews-toggle aria-controls="treatwell-reviews" aria-expanded="false" data-button-location="reviews_show_more" hidden>Weitere Bewertungen anzeigen</button>'), 'The show-more button must start hidden (all reviews show without JavaScript)');
assert(lp.includes(".lp-reviews.is-collapsed .lp-review--more {") && lp.includes("section.classList.add('is-collapsed');"), 'Only the script collapses the extra reviews');
assert(lp.indexOf('id="lp-trust-title"') < lp.indexOf('id="lp-reviews-title"') && lp.indexOf('id="lp-reviews-title"') < lp.indexOf('id={LEAD_FORM_TARGET_ID}'), 'Reviews sit between the trust section and the form');

// Booking bridge: offer note and the Treatwell service detail (TR4124153, user 2026-10-31).
assert(termin.includes('TREATWELL_BOOKING_URL'), 'Booking bridge must use the Treatwell booking URL constant');
assert(termin.includes('booking-forward-offer'), 'Booking bridge must expose promo context to users');
assert(termin.includes("offer === 'carbon-microneedling-aktion' && price === '175'"), 'Booking bridge must recognize the Carbon offer parameter');
assert(termin.includes('Aktion: Carbon-Peeling + Microneedling für CHF 175 statt CHF 250 wird an Treatwell übergeben.'), 'Booking bridge must show the Carbon offer note');
assert(termin.includes("'Carbon Microneedling': 'TR4124153'"), 'Booking bridge must open the Carbon Treatwell service detail');
assert(termin.includes("'Aquafacial + Microneedling': 'TR4124140'"), 'Booking bridge must keep the Aquafacial service detail');
assert(site.includes("TREATWELL_BOOKING_URL = 'https://buchung.treatwell.ch/ort/beauty-face-lift/'"), 'Shared booking target must be Treatwell');
assert(site.includes("'offer', 'price'"), 'Shared booking bridge must forward offer and price parameters');

// Tracking: ViewContent names the offer with its CHF 175 value.
assert(
  /'\/lp\/carbon-microneedling\/': \{\s*content_name: 'Carbon Microneedling Aktion',\s*treatment_name: 'Carbon Microneedling',\s*service: 'Carbon Microneedling',\s*value: 175,/.test(tracking),
  'Tracking must name the Carbon ViewContent event with the CHF 175 value',
);
assert(tracking.includes("metaEventName: 'ViewContent'"), 'Tracking must fire Meta ViewContent');

console.log('[ok] Carbon-Peeling + Microneedling LP offer (CHF 175 statt 250, until 30 November 2026), lead form, bridge and tracking are aligned.');
