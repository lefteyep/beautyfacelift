import { readFileSync } from 'node:fs';

const page = readFileSync('src/pages/kontakt/index.astro', 'utf8');
const site = readFileSync('shared/site.ts', 'utf8');
const worker = readFileSync('worker/routes/contact.ts', 'utf8');
const schema = readFileSync('src/lib/schema.ts', 'utf8');

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} missing: ${needle}`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label} must not include: ${needle}`);
  }
}

function assertOrdered(source, needles, label) {
  let lastIndex = -1;
  for (const needle of needles) {
    const index = source.indexOf(needle);
    if (index === -1) throw new Error(`${label} missing ordered item: ${needle}`);
    if (index < lastIndex) throw new Error(`${label} order violation at: ${needle}`);
    lastIndex = index;
  }
}

assertOrdered(page, [
  'ContactHero',
  'ContactMethodCards',
  'AppointmentInquiryForm',
  'TreatmentIntentGuide',
  'TrustSection',
  'LocationHoursMap',
  'ContactFAQ',
  'FinalCTA',
  'MobileStickyContactBar',
], 'contact page sections');

const pageRequirements = [
  'Kontakt & Beratung | Beauty Face Lift Zürich',
  'Hautberatung, Terminwünsche und Fragen zu Behandlungen: Teresa Stimac berät Sie persönlich an der Bahnhofstrasse 94 in Zürich.',
  'Persönliche Hautberatung &amp; Termine in Zürich',
  'Sie möchten einen Termin buchen, eine Behandlung abklären oder sind unsicher, was zu Ihrer Haut passt?',
  '4,8 aus 248+ Bewertungen',
  'Über 20 Jahre Erfahrung',
  'id="kontaktformular"',
  'Beratung anfragen',
  'WhatsApp schreiben',
  'Direkt online buchen',
  'Anrufen',
  'name="name"',
  'name="topic"',
  'name="treatment_interest"',
  'name="email"',
  'name="phone"',
  'name="preferred_contact"',
  'name="preferred_time"',
  'name="message"',
  'name="privacy"',
  'name="company"',
  'aria-hidden="true"',
  'tabindex="-1"',
  'Anfrage an Teresa senden',
  'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an, damit Teresa Ihnen antworten kann.',
  'Vielen Dank — Ihre Anfrage wurde gesendet.',
  'Noch unsicher, welche Behandlung passt?',
  'Warum Kundinnen Teresa vertrauen',
  'Beauty Face Lift an der Bahnhofstrasse 94',
  'Anfahrt auf der Karte',
  'Häufige Fragen vor der Kontaktaufnahme',
  'Bereit für Ihre persönliche Hautberatung?',
  'kontakt-mobile-bar',
  'contact_form_view',
  'contact_form_start',
  'contact_form_submit_success',
  'contact_form_submit_error',
  'contact_whatsapp_click',
  'contact_phone_click',
  'contact_email_click',
  'contact_booking_click',
  'contact_route_click',
  'contact_address_copy',
  'contact_map_load',
  'data-map-embed',
  'faq_open',
  'beautySalon()',
];

// The business node comes from the shared builder (one @id, phone, hours and profiles for every page).
for (const needle of ["'@type': 'BeautySalon'", 'openingHoursSpecification', 'sameAs', 'OPENING_HOURS']) {
  assertIncludes(schema, needle, 'business schema (src/lib/schema.ts)');
}

for (const requirement of pageRequirements) {
  assertIncludes(page, requirement, 'contact page');
}

assertNotIncludes(page, '>Nachricht senden<', 'contact page');
assertNotIncludes(page, '<label for="contact-company">Firma</label>', 'contact page');

const topicRequirements = [
  'Ich möchte einen Termin buchen',
  'Ich wünsche eine Behandlungsempfehlung',
  'Ich bin unsicher, welche Behandlung passt',
  'Frage zu Preisen oder Dauer',
  'Termin verschieben oder absagen',
  'Frage zur Anfahrt',
  'Allgemeine Frage',
];

for (const requirement of topicRequirements) {
  assertIncludes(site, requirement, 'contact topics');
}

// The Worker must read every field name the contact page posts (JSON and form posts alike),
// and keep the validation messages the page relies on.
const workerRequirements = [
  "treatment: getRecordString(payload, 'treatment', 'treatment_interest', 'treatmentInterest')",
  "treatment: getFormString(formData, 'treatment', 'treatment_interest', 'treatmentInterest')",
  "getRecordString(payload, 'preferredContactMethod', 'preferred_contact_method', 'preferred_contact')",
  "getFormString(formData, 'preferredContactMethod', 'preferred_contact_method', 'preferred_contact')",
  "getRecordString(payload, 'preferredCallbackTime', 'preferred_time')",
  "getFormString(formData, 'preferredCallbackTime', 'preferred_time')",
  "['Behandlung', data.treatment]",
  'Bitte geben Sie Ihren Namen an.',
  'Bitte geben Sie mindestens eine E-Mail-Adresse oder Telefonnummer an.',
  'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  'Bitte wählen Sie ein gültiges Thema aus.',
  'Bitte schreiben Sie eine Nachricht.',
  'Bitte bestätigen Sie die Datenschutzerklärung.',
];

// Every field the contact form posts must be one the Worker reads.
for (const field of ['name', 'email', 'phone', 'topic', 'message', 'treatment_interest', 'preferred_contact', 'preferred_time', 'privacy', 'company']) {
  assertIncludes(page, `name="${field}"`, 'contact page form');
  assertIncludes(worker, `'${field}'`, 'contact worker field keys');
}

for (const requirement of workerRequirements) {
  assertIncludes(worker, requirement, 'contact worker');
}

// The contact methods the form offers must be the ones the Worker accepts: one list, in shared/site.ts.
// (Until 2026-10-09 the Worker kept its own list without "Egal, was am schnellsten ist" and rejected it.)
assertIncludes(worker, 'CONTACT_PREFERRED_METHODS.includes(', 'contact worker (contact methods from shared/site.ts)');
assertNotIncludes(worker, 'const PREFERRED_CONTACT_METHODS', 'contact worker (no separate contact-method list)');

// Every ad form that posts to /api/contact must be accepted by the Worker on the live host:
// its hidden topic must be an allowed contact topic, and without a Turnstile widget on the page
// its campaign must be one the Worker exempts from Turnstile (otherwise every lead is rejected).
const allowedTopics = [...site.slice(site.indexOf('export const CONTACT_TOPICS')).split('] as const')[0].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const optionalCampaigns = [...(worker.match(/TURNSTILE_OPTIONAL_CAMPAIGNS = new Set\(\[([^\]]*)\]\)/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
for (const file of ['src/pages/lp/aquafacial/index.astro', 'src/pages/lp/aquafacial-microneedling/index.astro']) {
  const lp = readFileSync(file, 'utf8');
  if (!lp.includes('action="/api/contact"')) continue;
  const constant = (name) => lp.match(new RegExp(`const ${name} = '([^']*)'`))?.[1];
  const hidden = (name) => {
    const m = lp.match(new RegExp(`<input type="hidden" name="${name}" value=(?:"([^"]*)"|\\{([A-Z_]+)\\})`));
    return m ? m[1] ?? constant(m[2]) : undefined;
  };
  const topic = hidden('topic');
  if (topic !== undefined && !allowedTopics.includes(topic)) {
    throw new Error(`${file}: hidden topic "${topic}" is not in CONTACT_TOPICS, so the Worker rejects the form`);
  }
  if (!lp.includes('cf-turnstile')) {
    const campaign = hidden('campaign');
    if (!campaign || !optionalCampaigns.includes(campaign)) {
      throw new Error(`${file}: posts to /api/contact without a Turnstile widget, so its campaign ("${campaign ?? ''}") must be in TURNSTILE_OPTIONAL_CAMPAIGNS`);
    }
  }
}

console.log('Contact page source checks passed.');
