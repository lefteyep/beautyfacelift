// Old-site redirects through the real Worker entry (no network, no assets needed: redirects return first).
// Usage: tsx oldsite-harness.mts <worktree>
const WT = process.argv[2];
globalThis.fetch = (async (input: any) => { throw new Error(`blocked outbound fetch: ${String(input)}`); }) as typeof fetch;
const worker = (await import(`file:///${WT.replace(/\\/g, '/')}/worker/index.ts`)).default;
const env = { ASSETS: { fetch: async () => new Response('asset', { status: 200, headers: { 'Content-Type': 'text/html' } }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
async function go(url: string) {
  const res: Response = await worker.fetch(new Request(url, { redirect: 'manual' }), env as any, ctx as any);
  return { status: res.status, location: res.headers.get('location') };
}
const N = 'https://beautyfacelift-zuerich.ch';
const cases: Array<[string, number, string | null]> = [
  ['https://beautyfacelift.ch/', 301, `${N}/`],
  ['https://www.beautyfacelift.ch/', 301, `${N}/`],
  ['https://beautyfacelift.ch/behandlungen/hydra4face/', 301, `${N}/behandlungen/aquafacial-zuerich/`],
  ['https://beautyfacelift.ch/behandlungen/hydra4face', 301, `${N}/behandlungen/aquafacial-zuerich/`],
  ['https://beautyfacelift.ch/behandlungen/micro-needling/?utm_source=meta&fbclid=abc', 301, `${N}/behandlungen/microneedling-zuerich/?utm_source=meta&fbclid=abc`],
  ['https://beautyfacelift.ch/lp-aquafacial-microneedling/', 301, `${N}/lp/aquafacial-microneedling/`],
  ['https://beautyfacelift.ch/faq/', 301, `${N}/haeufige-fragen/`],
  ['https://beautyfacelift.ch/buchen/', 301, `${N}/termin/`],
  ['https://beautyfacelift.ch/danke/', 301, `${N}/kontakt/danke/`],
  ['https://beautyfacelift.ch/sauna-rooms/', 301, `${N}/`],
  ['https://beautyfacelift.ch/wp-content/uploads/2023/03/logo.png', 301, `${N}/`],
  ['https://beautyfacelift.ch/wp-admin/admin-ajax.php', 301, `${N}/`],
  ['https://beautyfacelift.ch/api/contact', 301, `${N}/`],
  // Existing behaviour on the live domain is unchanged.
  ['https://www.beautyfacelift-zuerich.ch/kontakt/', 301, `${N}/kontakt/`],
  ['https://beautyfacelift-zuerich.ch/kontakt', 301, `${N}/kontakt/`],
  ['https://beautyfacelift-zuerich.ch/ueber-uns/', 301, `${N}/ueber-mich/`],
  ['https://beautyfacelift-zuerich.ch/kontakt/', 200, null],
];
let fails = 0;
for (const [url, status, location] of cases) {
  const r = await go(url);
  const ok = r.status === status && (location === null || r.location === location);
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${url} -> ${r.status} ${r.location ?? ''}${ok ? '' : `  (expected ${status} ${location ?? ''})`}`);
}
console.log(fails ? `${fails} failing` : 'all pass');
