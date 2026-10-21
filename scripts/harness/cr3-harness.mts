import path from 'node:path';
import { pathToFileURL } from 'node:url';
// CR-3 check: subject and rows of the enquiry email per form. Runs the real contact route; fetch is
// stubbed (Turnstile accepted, Resend captured, nothing sent). Usage: tsx cr3-harness.mts <worktree>
const WT = path.resolve(process.argv[2] ?? process.cwd());
let lastEmail: any = null;
globalThis.fetch = (async (input: any, init: any) => {
  const url = String(input);
  if (url.includes('turnstile/v0/siteverify')) return new Response(JSON.stringify({ success: true }), { status: 200 });
  if (url.includes('api.resend.com')) {
    lastEmail = JSON.parse(init.body);
    // Negative control: the subject assertion must fail and propagate a nonzero exit.
    if (process.env.BFL_HARNESS_CALIBRATION === 'cr3') lastEmail.subject = 'planted wrong subject';
    return new Response('{"id":"stub"}', { status: 200 });
  }
  throw new Error(`blocked outbound fetch: ${url}`);
}) as typeof fetch;
const { contactRoute } = await import(pathToFileURL(path.join(WT, 'worker/routes/contact.ts')).href);
const env = { TURNSTILE_SECRET_KEY: 's', RESEND_API_KEY: 're_stub', CONTACT_TO_EMAIL: 'teresa@example.test', CONTACT_FROM_EMAIL: 'Beauty Face Lift <anfragen@example.test>' };
let n = 0;
async function send(body: Record<string, string>) {
  lastEmail = null;
  const res = await contactRoute(new Request('https://beautyfacelift-zuerich.ch/api/contact', {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', accept: 'application/json', 'cf-connecting-ip': `10.3.0.${++n}` },
  }), env as any);
  return { status: res.status, subject: lastEmail?.subject as string, text: lastEmail?.text as string, html: lastEmail?.html as string };
}
const base = { name: 'Harness Person', email: 'kunde@example.test', phone: '+41 79 000 00 00', privacyConsent: 'on', turnstileToken: 'tok' };
const cases: Array<[string, Record<string, string>, (r: any) => string[]]> = [
  ['combo ad page (no time field)', { ...base, topic: 'Ich möchte einen Termin buchen', campaign: 'aquafacial_microneedling', offer: 'aquafacial-microneedling-aktion', skinConcern: 'Glow', message: 'Test' }, (r) => [
    r.subject === 'Neue Kombi-Anfrage: Aquafacial + Microneedling – Harness Person' ? '' : `subject: ${r.subject}`,
    r.text.startsWith('Neue Kombi-Anfrage: Aquafacial + Microneedling\n') ? '' : 'text heading',
    r.html.includes('>Neue Kombi-Anfrage: Aquafacial + Microneedling</h1>') ? '' : 'html heading',
    !r.text.includes('Zeitwunsch') && !r.html.includes('Zeitwunsch') ? '' : 'Zeitwunsch row present',
    r.text.includes('Kampagne: aquafacial_microneedling') ? '' : 'campaign row missing',
  ]],
  ['/kontakt/ with a time', { ...base, topic: 'Allgemeine Frage', preferredCallbackTime: 'Vormittag', message: 'Test' }, (r) => [
    r.subject === 'Neue Kontaktanfrage: Allgemeine Frage — Harness Person' ? '' : `subject: ${r.subject}`,
    r.text.includes('Zeitwunsch: Vormittag') && r.html.includes('Zeitwunsch') ? '' : 'Zeitwunsch row missing',
    r.html.includes('>Neue Kontaktanfrage</h1>') ? '' : 'html heading',
  ]],
  ['/kontakt/ without a time', { ...base, topic: 'Allgemeine Frage', message: 'Test' }, (r) => [
    !r.text.includes('Zeitwunsch') && !r.html.includes('Zeitwunsch') ? '' : 'empty Zeitwunsch row shown',
  ]],
  ['Aquafacial Aktion page (unchanged)', { ...base, topic: 'Ich möchte einen Termin buchen', campaign: 'aquafacial_aktion', preferredCallbackTime: 'Nachmittag', message: 'Test' }, (r) => [
    r.subject === 'Neue Aquafacial Aktion Anfrage – Beauty Face Lift' ? '' : `subject: ${r.subject}`,
    r.text.includes('Telefonisch erreichbar: Nachmittag') ? '' : 'Telefonisch erreichbar row missing',
    r.html.includes('>Neue Aquafacial Aktion Anfrage</h1>') ? '' : 'html heading',
  ]],
];
let fails = 0;
for (const [label, body, check] of cases) {
  const r = await send(body);
  const problems = r.status >= 300 ? [`status ${r.status}`] : check(r).filter(Boolean);
  if (problems.length) fails++;
  console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${label}${problems.length ? '  -> ' + problems.join('; ') : ''}`);
}
console.log(fails ? `${fails} failing` : 'all pass');

process.exitCode = fails > 0 ? 1 : 0;
