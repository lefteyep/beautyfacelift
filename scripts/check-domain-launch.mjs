import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const canonicalOrigin = 'https://beautyfacelift-zuerich.ch';
const canonicalHost = 'beautyfacelift-zuerich.ch';
const wwwHost = 'www.beautyfacelift-zuerich.ch';
const tempWorkersHost = 'beautyfacelift.mediapaulo.workers.dev';
const oldOrigin = 'https://beautyfacelift.ch';
const oldWwwOrigin = 'https://www.beautyfacelift.ch';

const failures = [];

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertNotIncludes(text, needle, label) {
  assert(!text.includes(needle), `${label} must not include ${needle}`);
}

function collectFiles(path, files = []) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) return files;

  const stats = statSync(fullPath);
  if (stats.isFile()) {
    files.push(path.replaceAll('\\', '/'));
    return files;
  }

  for (const entry of readdirSync(fullPath, { withFileTypes: true })) {
    const relativePath = join(path, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      collectFiles(relativePath, files);
    } else if (entry.isFile()) {
      files.push(relativePath.replaceAll('\\', '/'));
    }
  }

  return files;
}

const wrangler = JSON.parse(read('wrangler.jsonc'));
assert(wrangler.workers_dev === false, 'wrangler.jsonc must set workers_dev=false');

const routes = Array.isArray(wrangler.routes) ? wrangler.routes : [];
const routeKeys = new Set(routes.map((route) => `${route.pattern}:${route.custom_domain}`));
assert(routeKeys.has(`${canonicalHost}:true`), 'wrangler.jsonc must include apex custom-domain route');
assert(routeKeys.has(`${wwwHost}:true`), 'wrangler.jsonc must include www custom-domain route');
assert(routes.length === 2, 'wrangler.jsonc must configure exactly the two new custom domains');
assert(!JSON.stringify(routes).includes('beautyfacelift.ch'), 'wrangler routes must not include the old domain');

const sharedSite = read('shared/site.ts');
for (const expected of [
  'CANONICAL_HOST',
  'CANONICAL_ORIGIN',
  'WWW_HOST',
  'TEMP_WORKERS_DEV_HOST',
  canonicalOrigin,
  wwwHost,
  tempWorkersHost,
]) {
  assert(sharedSite.includes(expected), `shared/site.ts must define ${expected}`);
}

const worker = read('worker/index.ts');
assert(worker.includes('canonicalHostRedirect'), 'worker/index.ts must define canonicalHostRedirect');
assert(worker.includes('Response.redirect'), 'worker/index.ts must issue redirects with Response.redirect');
assert(worker.includes('WWW_HOST'), 'worker/index.ts must redirect the www host');
assert(worker.includes('TEMP_WORKERS_DEV_HOST'), 'worker/index.ts must redirect the temporary workers.dev host');
// The old site is redirected here (docs/current/OLD-SITE-SHUTDOWN.md, decided 2026-10-20): its hosts
// may appear in the redirect map only, and the redirect runs before any other host handling.
assert(worker.includes("const OLD_SITE_HOSTS = new Set(['beautyfacelift.ch', 'www.beautyfacelift.ch']);"), 'worker/index.ts must list the old hosts in OLD_SITE_HOSTS');
assert((worker.match(/'(?:www\.)?beautyfacelift\.ch'/g) || []).length === 2, 'worker/index.ts must mention the old hosts only in OLD_SITE_HOSTS');
assert(worker.includes('oldSiteRedirect(request) ?? canonicalHostRedirect(request)'), 'worker/index.ts must redirect the old hosts before the canonical-host redirect');
assert(worker.includes("OLD_SITE_PATH_MAP[path] ?? '/'"), 'worker/index.ts must send unknown old paths to the home page');

const robots = read('public/robots.txt');
assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'robots.txt must point to /sitemap.xml on the new domain');
assertNotIncludes(robots, oldOrigin, 'robots.txt');
assertNotIncludes(robots, 'workers.dev', 'robots.txt');

assert(!existsSync(join(root, 'public/sitemap-public-draft.xml')), 'stale public/sitemap-public-draft.xml must be removed');

for (const path of ['README.md', 'docs/current/SETUP.md', 'docs/current/SITEMAP.md', 'docs/current/DOMAIN-LAUNCH.md']) {
  assert(existsSync(join(root, path)), `${path} must exist`);
  if (!existsSync(join(root, path))) continue;
  const text = read(path);
  assert(text.includes(canonicalOrigin), `${path} must mention the new canonical origin`);
  assertNotIncludes(text, 'Google Search Console Change of Address', path);
}

const sourceFiles = [
  'astro.config.mjs',
  'src',
  'public',
  'shared',
  'worker',
  '.env.example',
  '.dev.vars.example',
  'README.md',
  'docs/current/SETUP.md',
  'docs/current/SITEMAP.md',
  'docs/current/DOMAIN-LAUNCH.md',
].flatMap((path) => collectFiles(path));

for (const file of sourceFiles) {
  const text = read(file);
  assertNotIncludes(text, oldOrigin, file);
  assertNotIncludes(text, oldWwwOrigin, file);
}

if (existsSync(join(root, 'dist/index.html'))) {
  const distFiles = [
    'dist/index.html',
    'dist/robots.txt',
    'dist/sitemap.xml',
    'dist/sitemap-0.xml',
    'dist/behandlungen/aquafacial-zuerich/index.html',
    'dist/kontakt/index.html',
  ];

  for (const file of distFiles) {
    assert(existsSync(join(root, file)), `${file} must exist after build`);
    if (!existsSync(join(root, file))) continue;
    const text = read(file);
    assert(text.includes(canonicalOrigin), `${file} must include the new canonical origin`);
    assertNotIncludes(text, oldOrigin, file);
    assertNotIncludes(text, oldWwwOrigin, file);
    assertNotIncludes(text, tempWorkersHost, file);
  }

  if (existsSync(join(root, 'dist/robots.txt'))) {
    assert(read('dist/robots.txt').includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'built robots.txt must point to /sitemap.xml');
  }
}

if (failures.length > 0) {
  console.error('[fail] Domain launch verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[ok] Domain launch verification passed.');
