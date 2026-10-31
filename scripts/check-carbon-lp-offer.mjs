import { readFile, stat } from 'node:fs/promises';

const files = {
  lp: new URL('../src/pages/lp/carbon-microneedling/index.astro', import.meta.url),
  termin: new URL('../src/pages/termin/index.astro', import.meta.url),
  site: new URL('../shared/site.ts', import.meta.url),
  tracking: new URL('../src/lib/track.ts', import.meta.url),
  worker: new URL('../worker/routes/contact.ts', import.meta.url),
  whatsappButton: new URL('../src/components/lp/WhatsAppButton.astro', import.meta.url),
};

const [lp, termin, site, tracking, worker, whatsappButton] = await Promise.all(
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
assert(lp.includes('const SAVINGS_PERCENT = Math.round((1 - PROMO_PRICE / REGULAR_PRICE) * 100);'), 'Carbon LP must derive the saving in percent from the two prices');
assert(Math.round((1 - 175 / 250) * 100) === 30, 'The saving must be exactly 30 % (75 of 250)');
assert(lp.includes('const SAVINGS_LABEL = `Sie sparen CHF 75.– (${SAVINGS_PERCENT} %)`;'), 'Carbon LP must show the CHF 75 saving with the percentage (user decision 2026-10-31)');

// Treatwell hand-off hint (user decision 2026-10-31, B item 9): prepared, but off until the orchestrator confirms
// that Treatwell lists CHF 175 as the Aktionspreis. Only the constant may switch it on.
assert(lp.includes('const TREATWELL_SHOWS_PROMO = false;'), 'Carbon LP must keep the Treatwell hand-off hint switched off (TREATWELL_SHOWS_PROMO = false) until Treatwell lists CHF 175');
assert(lp.includes('const TREATWELL_PROMO_HINT = `Treatwell zeigt den Aktionspreis von CHF ${PROMO_PRICE}.–`;'), 'Carbon LP must define the Treatwell hand-off hint');
assert(lp.includes('{TREATWELL_SHOWS_PROMO && <p class="lp-hero-note">{TREATWELL_PROMO_HINT}</p>}'), 'The hand-off hint must render only behind the constant, under the hero CTAs');
assert((markup.match(/Treatwell zeigt den Aktionspreis/g) || []).length === 1, 'The hand-off hint text must exist only in its constant');
try {
  const built = await readFile(new URL('../dist/lp/carbon-microneedling/index.html', import.meta.url), 'utf8');
  assert(!built.includes('Treatwell zeigt den Aktionspreis'), 'The built page must not show the Treatwell hand-off hint while TREATWELL_SHOWS_PROMO is false');
} catch (error) {
  if (error.code !== 'ENOENT') throw error; // no build yet: the source checks above cover the switch
}
assert(lp.includes("const DURATION_LABEL = '90 Min.';"), 'Carbon LP must show the Treatwell duration');
assert(lp.includes("const OFFER_LABEL = 'Carbon-Peeling + Microneedling Aktion';"), 'Carbon LP must name the offer «Carbon-Peeling + Microneedling Aktion»');
assert(lp.includes("const OFFER_SLUG = 'carbon-microneedling-aktion';"), 'Carbon LP must use the carbon-microneedling-aktion offer slug');
assert(lp.includes("const BOOKING_SERVICE = 'Carbon Microneedling';"), 'Carbon LP must keep the Carbon Microneedling booking service');
assert(lp.includes('<span class="lp-hero-offer-price">CHF {PROMO_PRICE}.–</span>'), 'Carbon LP hero must show the promo price large');
assert(lp.includes('<span class="lp-hero-offer-old">statt <s class="lp-strike">CHF {REGULAR_PRICE}.–</s></span>'), 'Carbon LP hero must show «statt» and the struck regular price beside the promo price');
assert(lp.includes('<span class="lp-hero-offer-save">{SAVINGS_LABEL}</span>'), 'Carbon LP hero must render the saving as its own benefit line');

// Round 2 (user, 2026-10-31): the small line above the price says «Aktion · nur für kurze Zeit» instead of the
// duration, and the end date left the hero. One column, no separator dots, no "until" line.
assert(lp.includes("const OFFER_TAG = 'Aktion · nur für kurze Zeit';") && lp.includes('<span class="lp-hero-offer-label">{OFFER_TAG}</span>'), 'Carbon LP price line must start with «Aktion · nur für kurze Zeit»');
assert(!lp.includes('Aktion · {DURATION_LABEL}') && !lp.includes('lp-hero-offer-until') && !lp.includes('Angebot gültig bis'), 'Carbon LP hero price line must not show the duration or the end date (user, 2026-10-31)');
assert(!lp.includes('aria-hidden="true">· </span>'), 'Carbon LP price line must not stack separator dots');
assert(lp.includes('{DURATION_LABEL} in einer Sitzung') && lp.includes('eine Behandlung von ${DURATION_LABEL}'), 'The 90 Min. duration must still appear on the page (included section and FAQ 1)');

// Every regular price on the page is struck with the red diagonal (user, 2026-10-31): hero, closing band, sticky bar.
assert((lp.match(/<s class="lp-strike">/g) || []).length === 3, 'Hero, closing band and sticky bar must strike the regular price with .lp-strike');
assert(!/<s(?![^>]*class="lp-strike")[ >]/.test(lp) && !lp.includes('<del'), 'Carbon LP must not use a plain <s> or <del> (default horizontal strike)');
assert(lp.includes('statt <s class="lp-strike">CHF&nbsp;{REGULAR_PRICE}.–</s></h2>') && lp.includes('statt <s class="lp-strike">CHF {REGULAR_PRICE}</s></span>'), 'The closing band and the sticky bar keep «statt» before the struck price');
assert(/\.lp-strike \{\r?\n\s+position: relative;\r?\n\s+display: inline-block;\r?\n\s+text-decoration: none;/.test(lp), '.lp-strike must switch the browser strike off');
assert(/\.lp-strike::after \{[^}]*background: var\(--error\);[^}]*rotate\(-12deg\)/s.test(lp), '.lp-strike::after must draw the thin red diagonal (token --error, -12°)');
assert(lp.includes('.on-dark .lp-strike::after {') && lp.includes('color-mix(in srgb, var(--error) 70%, var(--cream))'), 'The strike needs its lighter red (tokens only) on the dark band and the sticky bar');
assert(/@media \(forced-colors: active\) \{\r?\n\s+\.lp-strike \{\r?\n\s+text-decoration: line-through;/.test(lp), 'High-contrast mode falls back to the browser strike');

// A "statt" price must be time-limited (Swiss price-indication rules): one ISO date drives the visible
// end date (FAQ 1, closing band, meta description) and the schema's priceValidUntil. Since round 2 the hero
// price line shows no date (user, 2026-10-31).
assert(lp.includes("const OFFER_VALID_UNTIL = '2026-11-30';"), 'Carbon LP offer must end on 30 November 2026');
assert(lp.includes("new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })"), 'Carbon LP must render «30. November 2026» from the ISO date');
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
assert(lp.includes("const BOOKING_CTA_LABEL = 'Jetzt Termin buchen';"), 'Carbon LP primary CTA reads «Jetzt Termin buchen» (user, 2026-10-31, round 2)');
assert(lp.includes("const STICKY_CTA_LABEL = 'Jetzt Termin buchen';"), 'Carbon LP sticky bar reads «Jetzt Termin buchen» too');
assert(!lp.includes('Jetzt auf Treatwell buchen'), 'Carbon LP must not keep the old «Jetzt auf Treatwell buchen» label anywhere (FAQ 2 included)');
assert(lp.includes("const LEAD_CTA_PROMPT = 'Noch unsicher?';") && lp.includes("const LEAD_CTA_LABEL = 'Beratung anfragen';"), 'Carbon LP must offer the form as «Noch unsicher? Beratung anfragen»');
assert(!lp.includes('Lieber zuerst Fragen klären') && !lp.includes("'Unverbindlich anfragen'"), 'Carbon LP must not keep the old secondary line');
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
assert(lp.includes('Kann ich direkt online buchen?') && lp.includes('Ja, das ist der einfachste Weg: Über «Jetzt Termin buchen» wählen Sie Ihren Termin direkt online auf Treatwell.'), 'Carbon LP FAQ must recommend booking online on Treatwell with the current button label');
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

// Hero crossfade (user, 2026-10-31, round 2): the Carbon photo is the first paint and the preloaded LCP image;
// the Microneedling close-up loads lazily as the second frame and fades in on top. Reduced motion: Carbon only.
assert(/src=\{heroCarbonImage\}\s+widths=\{lpHeroWidths\}\s+sizes=\{lpHeroSizes\}\s+format="webp"\s+quality=\{lpHeroQuality\}\s+loading="eager"\s+decoding="async"\s+fetchpriority="high"\s+class="lp-hero-frame lp-hero-frame--carbon"/.test(lp), 'The eager, high-priority hero image is frame A (Carbon)');
assert(/getImage\(\{\r?\n\s+src: heroCarbonImage,/.test(lp) && /preloadImage=\{\{\r?\n\s+href: lpHeroPreload\.src,/.test(lp), 'The preload stays on the Carbon hero image');
assert(
  /src=\{microneedlingStepImage\}\s+widths=\{lpHeroWidths\}\s+sizes=\{lpHeroSizes\}\s+format="webp"\s+quality=\{lpHeroQuality\}\s+loading="lazy"\s+decoding="async"\s+fetchpriority="low"\s+class="lp-hero-frame lp-hero-frame--needling"\s+alt="Microneedling an der Wange mit dem Microneedling-Pen"/.test(lp),
  'Frame B is the Microneedling close-up, lazy and low priority, with its factual alt text',
);
assert(lp.indexOf('lp-hero-frame--carbon') < lp.indexOf('lp-hero-frame--needling') && lp.indexOf('lp-hero-frame--needling') < lp.indexOf('</figure>'), 'Both frames sit in the hero figure, Carbon first');
assert(lp.includes('@keyframes lp-hero-frame-a') && lp.includes('@keyframes lp-hero-frame-b') && lp.includes('animation: lp-hero-frame-a 15s ease-in-out 3;'), 'The hero crossfade is a 15 s CSS cycle (6 s hold, 1.5 s fade, twice) that stops after three cycles (WCAG 2.2.2)');
assert(!lp.includes('infinite'), 'No endless animation on the Carbon LP');
assert(/\.lp-hero-media :global\(\.lp-hero-frame--needling\) \{\r?\n\s+opacity: 0;/.test(lp), 'Frame B starts invisible (first paint is the static Carbon image)');
assert(/@media \(prefers-reduced-motion: reduce\) \{\r?\n\s+\.lp-hero-media :global\(\.lp-hero-frame\) \{\r?\n\s+animation: none;\r?\n\s+\}\r?\n\r?\n\s+\.lp-hero-media :global\(\.lp-hero-frame--needling\) \{\r?\n\s+display: none;/.test(lp), 'Reduced motion: no zoom, no crossfade, Carbon frame only');

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
assert(!lp.includes('carbon_treatment_teresa'), 'Carbon LP must not show the generated image with a Teresa-like face and a laser handpiece');

// Images (user decisions 2026-10-31, relayed by the orchestrator): the Carbon series from PR #67 for the hero
// and two steps, the consented Aquafacial-series photos for the consultation and the Microneedling close-up,
// and Teresa's real portrait. hero.webp and methode-2.webp stay unused (duplicate scenes).
assert(lp.includes("import heroCarbonImage from '../../../assets/lp/carbon/hero-teresa.webp';") && lp.includes("hero-teresa.webp?url';"), 'Carbon LP hero must use hero-teresa.webp (also the schema image)');
assert(lp.includes("import carbonStepImage from '../../../assets/lp/carbon/methode-1.webp';"), 'Carbon step must use methode-1.webp');
assert(lp.includes("import nachsorgeStepImage from '../../../assets/lp/carbon/methode-3.webp';"), 'Maske/LED step must use the methode-3.webp still life');
assert(lp.includes('const lpHeroWidths = [480, 720, 960, 1088];'), 'Hero widths must not exceed the 1088 px source');
assert(/\.lp-hero-media \{\r?\n\s+aspect-ratio: 1 \/ 1;/.test(lp) && lp.includes('object-position: 50% 50%;'), 'Phone hero band must be square so both faces of hero-teresa stay in view');
for (const unused of ["from '../../../assets/lp/carbon/hero.webp'", "from '../../../assets/lp/carbon/methode-2.webp'", 'personal-treatment-zuerich']) {
  assert(!lp.includes(unused), `Carbon LP must not import ${unused}`);
}
assert(lp.includes("import hautanalyseImage from '../../../assets/lp/aquafacial/hautanalyse-beratung-zuerich.webp';"), 'Carbon LP skin-analysis slot must use the consultation image');
assert(lp.includes('ogImage={hautanalyseImage}'), 'Open Graph image must be the 4:3 consultation image (the centre crop to 1.91:1 would cut the faces off the 4:5 hero)');
assert(lp.includes("import microneedlingStepImage from '../../../assets/lp/aquafacial/microneedling-close-up-zuerich.webp';"), 'Carbon LP Microneedling step must use the Microneedling close-up');
assert(lp.includes("import teresaPortraitImage from '../../../assets/marketing/teresa_portrait.jpg';") && lp.includes('src={teresaPortraitImage}'), "Carbon LP trust block must show Teresa's real portrait, unedited");
for (const wrong of ['hero-aquafacial-microneedling-zuerich', 'aquafacial-close-up-zuerich', 'aquafacial-behandlung-zuerich', 'hero-image-aquafacial', 'spa_interior', 'consultation_trust', 'spa_facial_treatment']) {
  assert(!lp.includes(wrong), `Carbon LP must not use ${wrong} (Aquafacial device or replaced placeholder)`);
}
for (const alt of ['Teresa Stimac trägt die Carbon-Lotion mit dem Pinsel auf', 'Die Carbon-Lotion wird mit dem Pinsel auf die Wange aufgetragen', 'Behandlungstisch mit Carbon-Lotion, Pinsel und Microneedling-Pen', 'Teresa Stimac im Beratungsgespräch mit einer Kundin vor der Behandlung', 'Microneedling-Pen auf der Wange, Nahaufnahme', 'Teresa Stimac in ihrem Studio Beauty Face Lift in Zürich']) {
  assert(lp.includes(alt), `Carbon LP alt text must stay factual: «${alt}»`);
}
assert(!/<figcaption/.test(lp), 'Carbon LP images carry no captions');
assert(lp.includes('object-position: 50% 15%;'), 'Phone crop keeps the face visible in the trust frame');

// What is included: Teresa's list of the steps (2026-10-31) and the user's treatment description.
assert(lp.includes('Das ist inbegriffen'), 'Carbon LP must list what is included');
for (const item of ['Reinigung und Hautanalyse', 'Fruchtsäure-Peeling', 'Diamantabrasion', 'Carbon-Lotion und Laserbehandlung', 'Microneedling, Tiefe passend zu Ihrem Hauttyp', 'Maske', 'LED-Licht', 'Nachsorge-Hinweise für die Tage danach']) {
  assert(lp.includes(`'${item}'`), `Carbon LP included list must name «${item}»`);
}
assert(lp.includes('Dann wird eine Carbon-Lotion aufgetragen und mit dem Laser behandelt.'), 'Carbon LP must name the laser neutrally in the method step');
assert(lp.includes('mit Reinigung, Hautanalyse, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske, LED-Licht und Nachsorge-Hinweisen.'), "Carbon LP FAQ 1 must list every step of the treatment in Teresa's order");
assert(/'Fruchtsäure-Peeling',\s*'Diamantabrasion',\s*'Carbon-Lotion und Laserbehandlung',\s*'Microneedling/.test(lp), "Carbon LP included list must follow Teresa's order (Fruchtsäure-Peeling, Diamantabrasion, Carbon, Microneedling)");
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
  /Das Carbon-Peeling kann das Hautbild klären, das Microneedling die natürliche Hauterneuerung unterstützen –\r?\n\s+Teresa Stimac stimmt beides an der Bahnhofstrasse&nbsp;94 in Zürich persönlich auf Ihre Haut ab\./.test(lp),
  'Carbon LP hero lead must name the benefit in the cautious «kann …» form (round-2 wording, user 2026-10-31)',
);
assert(!/Erst klärt das Carbon-Peeling/.test(lp), 'Carbon LP hero lead must not state the Carbon-Peeling effect as a fact (orchestrator correction, 2026-10-31)');

// Goals section (user, 2026-10-31, round 2): goal framing, the three goals the page already named, cautious wording.
assert(lp.includes('<h2 id="lp-goals-title" class="lp-section-title">Was die Behandlung bewirken kann</h2>'), 'Goals heading reads «Was die Behandlung bewirken kann»');
assert(lp.includes('Jede Haut reagiert anders. Was für Sie realistisch ist, klärt Teresa Stimac vor der Behandlung mit Ihnen.'), 'Goals lead sets the expectation without a promise');
for (const title of ['Feiner wirkende Poren', 'Glatter wirkendes Hautbild', 'Frischer wirkender Teint']) {
  assert(lp.includes(`title: '${title}'`), `Goals must name «${title}» (a goal, not a stated result)`);
}
for (const [, text] of lp.matchAll(/\{ title: '[^']+', text: '([^']+)' \}/g)) {
  assert(/\bkann\b|\bkönnen\b/.test(text), `Every goal text stays in the cautious «kann» form: ${text}`);
}
assert(!/title: '[^']*\bwirkt\b/.test(lp) && !/title: '[^']*\bwirken\b/.test(lp), 'Goal titles must not state a result («wirkt …»)');
assert(!lp.includes('Typische Behandlungsziele') && !lp.includes('ehrlich eingeordnet'), 'The old goals heading and lead are gone');
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
// Map (user, 2026-10-31, round 2): a static image rendered once from OpenStreetMap tiles, with the ODbL credit,
// the whole image linking to Google Maps. No embed, no consent button, no script.
assert(lp.includes("import mapImage from '../../../assets/lp/carbon/map-bahnhofstrasse-94.webp';") && lp.includes('src={mapImage}'), 'Carbon LP must show the static OSM map image');
assert(lp.includes('class="lp-map-panel"') && lp.includes('href={googleMapsDirectionsUrl}') && lp.includes('data-button-location="location_map"'), 'The map image must link to Google Maps with data-button-location="location_map"');
assert((lp.match(/data-source="carbon_location"/g) || []).length === 2, 'Route button and map link both carry data-source="carbon_location"');
assert(lp.includes('<p class="lp-map-credit"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap-Mitwirkende</a></p>'), 'The ODbL credit «© OpenStreetMap-Mitwirkende» must sit under the map');
assert(lp.includes('alt="Kartenausschnitt: Bahnhofstrasse 94 in Zürich, wenige Gehminuten vom Hauptbahnhof – Route in Google Maps öffnen"') && !/class="lp-map-panel"[^>]*aria-label/.test(lp.replace(/\r?\n\s+/g, ' ')), 'The map link is named by its image alt text (no aria-label overriding it)');
const mapFile = await stat(new URL('../src/assets/lp/carbon/map-bahnhofstrasse-94.webp', import.meta.url));
assert(mapFile.size <= 120 * 1024, `The static map must stay at or under 120 KB (got ${Math.round(mapFile.size / 1024)} KB)`);
for (const gone of ['<iframe', 'data-map-embed', 'googleMapsEmbedUrl', 'Karte laden', 'data-map-load', 'initMap', 'output=embed', 'tile.openstreetmap.org']) {
  assert(!lp.includes(gone), `Carbon LP must not keep the map embed or load live tiles (${gone})`);
}

// Floating WhatsApp disc (user, 2026-10-31, round 2): WhatsApp green, shown once the hero has left the viewport.
// Carbon-only through two component props; the other pages keep the cocoa disc at 25 % scroll depth.
assert(lp.includes('<WhatsAppButton variant="sticky" tone="whatsapp" reveal="page" message={whatsappMessage} source="carbon_floating_whatsapp" label="Per WhatsApp anfragen" />'), 'The floating disc uses tone="whatsapp" and reveal="page" and keeps its source');
assert(lp.includes("body.classList.toggle('lp-wa-scrolled', pastHero);"), 'The page reveals the disc once the hero has left the viewport');
assert(whatsappButton.includes("tone?: 'brand' | 'whatsapp';") && whatsappButton.includes("reveal?: 'scroll' | 'page';") && whatsappButton.includes("tone = 'brand',") && whatsappButton.includes("reveal = 'scroll',"), 'WhatsAppButton keeps its defaults (cocoa disc, 25 % scroll rule) for the other pages');
assert(whatsappButton.includes("if (!disc || disc.getAttribute('data-wa-reveal') === 'page') return;"), 'WhatsAppButton leaves the reveal to the page when reveal="page"');
assert(/\.wa-sticky--whatsapp \{[^}]*background: #25d366;[^}]*color: #ffffff;/s.test(whatsappButton), 'tone="whatsapp" paints the disc in WhatsApp green with a white glyph');

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
assert(lp.includes('<h2 id="lp-reviews-title" class="lp-section-title">Echte Kundenerfahrungen</h2>'), 'Carbon LP reviews heading reads «Echte Kundenerfahrungen» (user, 2026-10-31)');
assert(lp.includes('<p class="lp-section-lead">4,8 aus 260+ Bewertungen auf Treatwell. Eine Auswahl, wörtlich übernommen.</p>'), 'The reviews lead keeps the Treatwell source visible');
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
