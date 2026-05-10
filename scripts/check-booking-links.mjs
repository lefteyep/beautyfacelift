import { readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const treatwellBookingUrl = 'https://buchung.treatwell.ch/ort/beauty-face-lift/';
const trackedFiles = execFileSync('git', ['ls-files', 'src', 'shared', 'public', 'worker'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);

const disallowedBookingTargets = [
  'https://beautyfacelift.ch/termin/',
  'https://beautyfacelift-zuerich.ch/termin/',
  'href="/termin/"',
  "href='/termin/'",
  "href: '/termin/'",
  'href="#buchen"',
  "href='#buchen'",
  'ctaHref="#buchen"',
  "ctaHref='#buchen'",
  "href = '#buchen'",
  'urlTemplate": "https://beautyfacelift.ch/termin/',
  'urlTemplate": "https://beautyfacelift-zuerich.ch/termin/',
  'aesthetika',
];

const failures = [];

for (const file of trackedFiles) {
  const absolutePath = new URL(file, `file://${repoRoot.replaceAll(sep, '/')}/`);
  const text = readFileSync(absolutePath, 'utf8');

  for (const target of disallowedBookingTargets) {
    const lowerText = text.toLowerCase();
    const lowerTarget = target.toLowerCase();
    if (!lowerText.includes(lowerTarget)) continue;

    failures.push(`${relative(repoRoot, file)} contains disallowed booking target: ${target}`);
  }

  if (file.startsWith('src/pages/') && text.includes('BookingWidget')) {
    failures.push(`${relative(repoRoot, file)} embeds the legacy BookingWidget instead of linking to Treatwell.`);
  }
}

const sharedSite = readFileSync(new URL('shared/site.ts', `file://${repoRoot.replaceAll(sep, '/')}/`), 'utf8');
if (!sharedSite.includes(`TREATWELL_BOOKING_URL = '${treatwellBookingUrl}'`)) {
  failures.push('shared/site.ts must export TREATWELL_BOOKING_URL with the Treatwell booking URL.');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[ok] booking links target Treatwell');
