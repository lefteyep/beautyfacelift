import { readFileSync } from 'node:fs';

const files = {
  site: readFileSync('shared/site.ts', 'utf8'),
  base: readFileSync('src/layouts/Base.astro', 'utf8'),
  nav: readFileSync('src/components/Nav.astro', 'utf8'),
  footer: readFileSync('src/components/Footer.astro', 'utf8'),
  home: readFileSync('src/pages/index.astro', 'utf8'),
  overview: readFileSync('src/pages/behandlungen/index.astro', 'utf8'),
  termin: readFileSync('src/pages/termin/index.astro', 'utf8'),
  contact: readFileSync('src/pages/kontakt/index.astro', 'utf8'),
};

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} must include: ${needle}`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label} must not include: ${needle}`);
  }
}

assertIncludes(files.site, "label: 'Aquafacial'", 'shared treatment naming');
assertIncludes(files.site, "'Beratung / Empfehlung'", 'contact treatment interests');
const protectedTreatmentName = ['Hydra', 'facial'].join('');
assertNotIncludes(files.site, `label: '${protectedTreatmentName}'`, 'shared treatment naming');

assertIncludes(files.nav, 'Aquafacial', 'navigation');
assertIncludes(files.nav, 'Microneedling', 'navigation');
assertIncludes(files.nav, 'Hautziele', 'navigation');

assertIncludes(files.base, 'mobile-conversion-bar', 'global mobile CTA');
assertIncludes(files.base, 'Frage stellen', 'global mobile CTA');
assertIncludes(files.base, 'hideMobileCta', 'global mobile CTA legal exclusion');

assertIncludes(files.footer, 'OPENING_HOURS', 'footer');
assertIncludes(files.footer, 'Kosmetikstudio an der Bahnhofstrasse in Zürich', 'footer local SEO');

assertIncludes(files.home, 'Premium Kosmetik in Zürich für gepflegte, natürlich strahlende Haut', 'homepage hero');
assertIncludes(files.home, 'Welche Behandlung passt zu Ihrem Hautziel?', 'homepage goal finder');
assertIncludes(files.home, 'Beauty Face Lift an der Bahnhofstrasse 94', 'homepage location');

assertIncludes(files.overview, 'id="hautziele"', 'treatment overview');
assertIncludes(files.overview, 'Starten Sie mit Ihrem Hautziel', 'treatment overview');
assertIncludes(files.overview, 'Behandlungen im Vergleich', 'treatment overview');

assertIncludes(files.termin, 'Termin bei Beauty Face Lift Zürich buchen', 'booking hub');
assertIncludes(files.termin, 'Ich weiss, was ich buchen möchte', 'booking hub');
assertIncludes(files.termin, 'Ich bin unsicher', 'booking hub');
assertIncludes(files.termin, 'Ich habe eine schnelle Frage', 'booking hub');
assertIncludes(files.termin, 'window.location.replace(href)', 'booking hub');

assertIncludes(files.contact, 'Persönliche Hautberatung &amp; Termine in Zürich', 'contact page');
assertIncludes(files.contact, 'name="treatment_interest"', 'contact form');
assertIncludes(files.contact, 'name="preferred_contact"', 'contact form');
assertIncludes(files.contact, 'name="preferred_time"', 'contact form');
assertIncludes(files.contact, 'name="privacy"', 'contact form');
assertIncludes(files.contact, 'Anfrage an Teresa senden', 'contact form');

console.log('[ok] Redesign brief quick-win source checks passed.');
