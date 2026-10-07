import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertFile(path) {
  assert(existsSync(join(root, path)), `Missing expected file: ${path}`);
}

function assertIncludes(path, text) {
  const content = read(path);
  assert(content.includes(text), `${path} must include "${text}"`);
}

function assertNotIncludes(path, text) {
  const content = read(path);
  assert(!content.includes(text), `${path} must not include "${text}"`);
}

const serviceGroups = [
  'Gesicht & Haut',
  'Laser-Haarentfernung',
  'Waxing',
  'Wimpern & Brauen',
  'Make-up',
  'Massage',
];

const seoRoutes = [
  'src/pages/behandlungen/gesichtsbehandlung-zuerich/index.astro',
  'src/pages/behandlungen/laser-haarentfernung-zuerich/index.astro',
  'src/pages/behandlungen/waxing-zuerich/index.astro',
  'src/pages/behandlungen/wimpern-brauen-zuerich/index.astro',
  'src/pages/behandlungen/make-up-zuerich/index.astro',
  'src/pages/behandlungen/massage-zuerich-bahnhofstrasse/index.astro',
];

for (const route of seoRoutes) assertFile(route);

assertIncludes('shared/site.ts', 'SERVICE_GROUPS');
for (const group of serviceGroups) assertIncludes('shared/site.ts', group);

assertIncludes('src/components/Nav.astro', 'SERVICE_GROUPS');
assertIncludes('src/components/Footer.astro', 'SERVICE_GROUPS');
assertIncludes('src/pages/behandlungen/index.astro', 'SERVICE_GROUPS');
for (const group of serviceGroups) assertIncludes('src/pages/behandlungen/index.astro', group);

for (const keyword of [
  'Gesichtsbehandlung Zürich',
  'Laser-Haarentfernung Zürich',
  'Waxing Zürich',
  'Wimpern & Brauen Zürich',
  'Make-up Zürich',
  'Massage Zürich Bahnhofstrasse',
]) {
  assertIncludes('src/pages/index.astro', keyword);
}

for (const file of ['public/llms.txt', 'public/llms-full.txt']) {
  for (const group of serviceGroups) assertIncludes(file, group);
  for (const route of [
    '/behandlungen/gesichtsbehandlung-zuerich/',
    '/behandlungen/laser-haarentfernung-zuerich/',
    '/behandlungen/waxing-zuerich/',
    '/behandlungen/wimpern-brauen-zuerich/',
    '/behandlungen/make-up-zuerich/',
    '/behandlungen/massage-zuerich-bahnhofstrasse/',
  ]) {
    assertIncludes(file, route);
  }
}

assertNotIncludes('src/pages/kontakt/index.astro', 'Turnstile ist lokal noch nicht konfiguriert');

for (const file of [
  'src/pages/index.astro',
  'src/pages/ueber-mich/index.astro',
  'src/pages/termin/index.astro',
]) {
  assertNotIncludes(file, 'aggregateRating');
  assertNotIncludes(file, '"review":');
}

for (const [file, phrase] of [
  ['src/pages/behandlungen/aquafacial-zuerich/index.astro', 'revolutionäre Technologie'],
  ['src/pages/behandlungen/aquafacial-zuerich/index.astro', 'tief in die Haut eingeschleust'],
  ['src/pages/behandlungen/fruchtsaeure-peeling-zuerich/index.astro', 'medizinisch formulierte Peelings'],
  ['src/pages/behandlungen/microneedling-zuerich/index.astro', 'Infektionsrisiko'],
]) {
  assertNotIncludes(file, phrase);
}

if (failures.length > 0) {
  console.error('SEO plan smoke check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEO plan smoke check passed.');
