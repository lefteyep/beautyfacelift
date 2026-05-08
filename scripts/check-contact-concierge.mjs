import { readFileSync } from 'node:fs';

const page = readFileSync('src/pages/kontakt/index.astro', 'utf8');
const styles = readFileSync('src/styles/components.css', 'utf8');
const site = readFileSync('shared/site.ts', 'utf8');
const worker = readFileSync('worker/routes/contact.ts', 'utf8');

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} missing: ${needle}`);
  }
}

const pageRequirements = [
  'Kontakt & Termin buchen bei Beauty Face Lift Zürich',
  'id="contact-hero-booking"',
  'id="contact-hero-whatsapp"',
  'id="contact-hero-phone"',
  'id="contact-card-booking"',
  "id: 'contact-card-whatsapp'",
  "id: 'contact-card-phone'",
  "id: 'contact-card-email'",
  'id="contact-card-form"',
  'id="contact-route"',
  'id="contact-form-submit"',
  'data-event="click_booking"',
  'data-event="click_whatsapp"',
  'data-event="click_phone"',
  "event: 'click_email'",
  'data-event="click_route"',
  'data-event="form_submit"',
  'name="preferredContactMethod"',
  'Anfrage an Teresa senden',
  'kontakt-mobile-cta',
  'https://www.google.com/maps/dir/?api=1',
  'consultationTrust',
  'openingHoursSpecification',
  'sameAs',
];

for (const requirement of pageRequirements) {
  assertIncludes(page, requirement, 'contact page');
}

const styleRequirements = [
  '.kontakt-clean',
  '.kontakt-clean-hero',
  '.kontakt-clean-panel',
  '.kontakt-clean-form-section',
  '.kontakt-clean-support',
  '.kontakt-clean-studio',
  '.kontakt-mobile-cta',
  '.kontakt-mobile-cta.is-visible',
  'env(safe-area-inset-bottom)',
];

for (const requirement of styleRequirements) {
  assertIncludes(styles, requirement, 'contact styles');
}

const topicRequirements = [
  'Ich möchte einen Termin buchen',
  'Ich möchte eine Behandlungsempfehlung',
  'Frage zu Preisen',
  'Termin verschieben oder absagen',
  'Anfahrt & Studio',
  'Allgemeine Frage',
];

for (const requirement of topicRequirements) {
  assertIncludes(site, requirement, 'contact topics');
}

const workerRequirements = [
  'preferredContactMethod: string',
  "preferredContactMethod: getString(payload.preferredContactMethod)",
  "preferredContactMethod: getString(formData.get('preferredContactMethod'))",
  'Bevorzugter Kontaktweg',
];

for (const requirement of workerRequirements) {
  assertIncludes(worker, requirement, 'contact worker');
}

console.log('Contact concierge source checks passed.');
