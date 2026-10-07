import { readFile } from 'node:fs/promises';

// The two "simple" Meta ad pages share one layout: hero (H1, lead, three facts, booking CTA, rating),
// benefits, booking panel. This pins their booking/analytics contract and the copy rules.
const pages = [
  { slug: 'microneedling', service: 'Microneedling', treatment: 'Microneedling', h1: 'Microneedling in Zürich' },
  { slug: 'peeling', service: 'Peeling', treatment: 'Fruchtsäure Peeling', h1: 'Fruchtsäure Peeling in Zürich' },
];

const layout = await readFile(new URL('../src/layouts/LandingPage.astro', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(layout.includes('<meta name="robots" content="noindex, nofollow">'), 'Ad pages must stay noindex via LandingPage.astro');

for (const page of pages) {
  const lp = await readFile(new URL(`../src/pages/lp/${page.slug}/index.astro`, import.meta.url), 'utf8');
  const name = `/lp/${page.slug}/`;
  const [markup, styles = ''] = lp.split('<style>');
  // Everything before <style> minus import lines: the copy plus a little code, enough for the term checks.
  const copy = markup.replace(/^import .*$/gm, '');

  assert(lp.includes("import LandingPage from '../../../layouts/LandingPage.astro'"), `${name} must use the LandingPage layout`);
  assert(lp.includes(`const bookingHref = bookingLinkForService('${page.service}');`), `${name} must book through the Treatwell bridge for ${page.service}`);
  assert(
    lp.includes(`<a href={bookingHref} class="btn" data-treatment="${page.treatment}" data-button-location="lp_hero">Termin buchen</a>`),
    `${name} hero CTA must keep href, data-treatment and data-button-location`,
  );
  assert(lp.includes(`treatment="${page.treatment}"`) && lp.includes('href={bookingHref}'), `${name} booking panel must keep the treatment and booking link`);
  assert(lp.includes('<TrustStrip variant="rating" rating="4,8"'), `${name} must show the 4,8 rating line under the hero CTA`);
  assert(lp.includes('Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung'), `${name} must keep the shared Teresa fact`);
  assert(lp.includes(`>${page.h1}</h1>`), `${name} H1 must read "${page.h1}"`);

  for (const term of ['Hydra', 'Hydro', 'Vortex', 'patentiert', 'ß']) {
    assert(!copy.includes(term), `${name} must not contain "${term}"`);
  }
  assert(!/\b(du|dich|dir|dein|deine|deinen|deiner)\b/i.test(copy), `${name} must address visitors with "Sie", not "du"`);

  assert(!/font-style:\s*italic/.test(styles), `${name} must not use italics`);
  assert(!/text-transform:\s*uppercase/.test(styles), `${name} labels must stay in sentence case`);
  assert(!/#[0-9a-f]{3,8}\b/i.test(styles), `${name} styles must use design tokens instead of hard-coded colours`);
  assert(!/\sstyle=["{]/.test(markup), `${name} markup must not use inline styles`);
}

console.log('[ok] Microneedling and Peeling ad pages keep their booking, analytics and copy contract.');
