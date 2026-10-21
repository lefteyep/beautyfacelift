// Synthetic full-entry manual capture/recovery checks. No external calls or live D1.
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import worker from '../../worker/index.ts';

type Env = Parameters<typeof worker.fetch>[1];
type Ctx = Parameters<typeof worker.fetch>[2];
type Row = Record<string, unknown>;
let failures = 0;
let checks = 0;
function check(value: unknown, label: string): void {
  checks += 1;
  console.log(`${value ? '[ok]' : '[fail]'} ${label}`);
  if (!value) failures += 1;
}
const db = createFakeD1({ migrationsDir: fileURLToPath(new URL('../../worker/migrations/', import.meta.url)) });
const network: string[] = [];
const background: unknown[] = [];
const errors: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  network.push(String(input));
  throw new Error('No external requests allowed');
}) as typeof fetch;
console.error = (...args: unknown[]) => errors.push(args.map(String).join(' '));
const baseEnv = {
  ASSETS: { async fetch() { return new Response('fixture'); } },
  ENVIRONMENT: 'development', LEADS_DEV_EMAIL: 'mediapaulo@gmail.com', LEADS_SIGNING_SECRET: 'synthetic-manual-secret', LEADS_CAPTURE: 'on', LEADS_DB: db,
};
const ctx = { waitUntil(promise: unknown) { background.push(promise); }, passThroughOnException() {}, props: {} } as unknown as Ctx;
const env = (overrides: Record<string, unknown> = {}) => ({ ...baseEnv, ...overrides }) as unknown as Env;
const rows = () => db._db.prepare('SELECT * FROM leads').all() as Row[];
const events = () => db._db.prepare('SELECT * FROM lead_events').all() as Row[];
const row = (id: string) => db._db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as Row | undefined;
const count = () => JSON.stringify([rows(), events()]);
const path = '/admin/leads/new/';
async function request(method: string, fields: Record<string, string> | URLSearchParams = {}, overrides: Record<string, unknown> = {}, headers: Record<string, string> = { 'Sec-Fetch-Site': 'same-origin' }, host = 'http://localhost') {
  const response = await worker.fetch(new Request(`${host}${path}`, {
    method, headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    ...(method === 'GET' || method === 'HEAD' ? {} : { body: new URLSearchParams(fields).toString() }),
  }), env(overrides), ctx);
  return { status: response.status, body: await response.text(), headers: response.headers };
}
const form = await request('GET');
const csrf = form.body.match(/name="_csrf" value="([a-f0-9]{64})"/)?.[1] ?? '';
const entryId = form.body.match(/name="entry_id" value="([^"]+)"/)?.[1] ?? '';
check(form.status === 200 && csrf.length === 64 && /^[0-9a-f-]{36}$/.test(entryId), 'GET returns protected capture form with CSRF and replay ID');
check(form.headers.get('cache-control') === 'no-store' && form.body.includes('noindex, nofollow'), 'staff form is not cached or indexed');
check(form.body.includes('name="original_reference"') && form.body.includes('name="original_received_at"') && form.body.includes('Es wird keine E-Mail versendet.'), 'form explains recovery reference/time and no-mail behavior');
const secondForm = await request('GET');
check(!secondForm.body.includes(`name="entry_id" value="${entryId}"`), 'separate capture forms have distinct replay IDs');
check((await request('HEAD')).body === '', 'HEAD has no body');
check((await request('PUT')).status === 405, 'unsupported method is rejected');
const valid = {
  _csrf: csrf, entry_id: entryId, channel: 'phone', name: 'Synthetic Phone <fixture>', phone: '079 123 45 67',
  email: '', treatment: 'Fixture topic', message: 'Line one\r\n<fixture>', notes: 'Agency note',
  original_reference: '', original_received_at: '', original_source: '',
};
const beforeDenied = count();
for (const [label, overrides, headers, host] of [
  ['no staff identity', { LEADS_DEV_EMAIL: undefined }, {}, 'http://localhost'],
  ['production ignores local dev identity', { ENVIRONMENT: 'production' }, {}, 'http://localhost'],
  ['remote hostname ignores local dev identity', {}, {}, 'https://example.test'],
  ['untrusted email header is not identity', { LEADS_DEV_EMAIL: undefined }, { 'Cf-Access-Authenticated-User-Email': 'mediapaulo@gmail.com' }, 'http://localhost'],
] as const) {
  const response = await request('POST', valid, overrides, headers, host);
  check(response.status === 401, `${label}: POST 401`);
}
for (const [label, fields, headers] of [
  ['missing token', { ...valid, _csrf: '' }, { 'Sec-Fetch-Site': 'same-origin' }],
  ['wrong token', { ...valid, _csrf: 'f'.repeat(64) }, { 'Sec-Fetch-Site': 'same-origin' }],
  ['cross-site', valid, { 'Sec-Fetch-Site': 'cross-site' }],
  ['no browser provenance', valid, {}],
  ['foreign origin', valid, { Origin: 'https://other.example.test' }],
] as const) check((await request('POST', fields, {}, headers)).status === 403, `${label}: POST 403`);
check((await request('POST', valid, { LEADS_SIGNING_SECRET: undefined })).status === 503, 'missing signing secret fails closed');
check((await request('POST', valid, { LEADS_CAPTURE: 'off' })).status === 503, 'capture off rejects valid POST');
check((await request('POST', valid, { LEADS_CAPTURE: undefined })).status === 503, 'capture missing rejects valid POST');
const disabled = await request('GET', {}, { LEADS_CAPTURE: 'off' });
check(disabled.body.includes('Die Erfassung ist noch nicht freigegeben.') && disabled.body.includes('type="submit" disabled'), 'capture off shows unavailable form and disabled submit');
check(count() === beforeDenied, 'auth, CSRF and capture-gate rejections write neither rows nor events');

for (const [label, patch] of [
  ['unknown channel', { channel: 'email' }], ['invalid replay id', { entry_id: 'bad' }],
  ['missing name', { name: '  ' }], ['name too long', { name: 'x'.repeat(121) }], ['name control character', { name: 'a\nb' }],
  ['missing phone for phone', { phone: '' }], ['WhatsApp needs phone', { channel: 'whatsapp', phone: '', email: 'fixture@example.test' }],
  ['invalid phone', { phone: 'not a number 0791234567' }], ['invalid email', { email: 'fixture@example.test?bcc=x' }],
  ['long treatment', { treatment: 'x'.repeat(201) }], ['long message', { message: 'x'.repeat(4001) }], ['long notes', { notes: 'x'.repeat(4001) }],
] as const) check((await request('POST', { ...valid, ...patch })).status === 400, `${label}: input rejected`);
const repeated = new URLSearchParams(valid);
repeated.append('name', 'Second name');
check((await request('POST', repeated)).status === 400, 'ambiguous repeated fields rejected');
check(count() === beforeDenied, 'invalid inputs write nothing');
const invalidPage = await request('POST', { ...valid, phone: '', name: '<script>fixture</script>' });
check(invalidPage.body.includes('value="&lt;script&gt;fixture&lt;/script&gt;"') && invalidPage.body.includes(`name="entry_id" value="${entryId}"`), 'failed save retains escaped input and the same replay ID');

const saved = await request('POST', valid, {}, { Origin: 'http://localhost' });
check(saved.status === 303 && saved.headers.get('location') === `/admin/leads/${entryId}/?ok=erfasst`, 'valid same-origin Origin fallback saves and redirects');
const phone = row(entryId)!;
check(rows().length === 1 && events().length === 1 && phone.source === 'manual' && phone.status === 'neu', 'phone capture creates one manual lead and event');
check(phone.phone_normalized === '41791234567' && phone.message === 'Line one\n<fixture>' && phone.preferred_contact_method === 'Telefon', 'phone/message normalization and contact channel retained');
check(phone.marketing_consent === 0 && phone.confirmation_sent_at === null && phone.nudge_sent_at === null && phone.followup_sent_at === null && phone.review_sent_at === null, 'manual creation records no consent or false mail-delivery claims');
const audit = JSON.parse(String(events()[0].meta));
check(events()[0].actor === 'agentur' && audit.channel === 'phone' && audit.automation === 'none', 'audit identifies staff, channel and no automation');
const snapshot = count();
const replay = await request('POST', { ...valid, name: 'Do not overwrite', notes: 'Do not overwrite' });
check(replay.status === 303 && replay.headers.get('location')?.endsWith('?ok=vorhanden') && count() === snapshot, 'replay opens existing record without overwrite or duplicate audit');
const whatsappId = crypto.randomUUID();
check((await request('POST', { ...valid, entry_id: whatsappId, channel: 'whatsapp' })).status === 303 && row(whatsappId)?.preferred_contact_method === 'WhatsApp', 'WhatsApp entry uses its own ID and channel');

const recoveryId = crypto.randomUUID();
const recovery = { ...valid, channel: 'recovery', original_reference: recoveryId.toUpperCase(), original_received_at: '2026-10-01T10:15:30.125+02:00', original_source: 'aquafacial-microneedling-lp', phone: '', email: 'RECOVERY@example.test', notes: 'Missing from list; checked owner notification.' };
const beforeRecovery = count();
for (const [label, patch] of [
  ['reference missing', { original_reference: '' }], ['reference invalid', { original_reference: '123' }],
  ['timestamp missing', { original_received_at: '' }], ['timestamp lacks timezone', { original_received_at: '2026-10-01T10:15:30' }],
  ['invalid calendar day', { original_received_at: '2026-02-30T10:15:30Z' }], ['invalid time', { original_received_at: '2026-10-01T25:15:30Z' }],
  ['invalid zone', { original_received_at: '2026-10-01T10:15:30+15:00' }], ['future time', { original_received_at: '2099-10-01T10:15:30Z' }],
  ['reason missing', { notes: '' }], ['original source missing', { original_source: '' }], ['manual is not website source', { original_source: 'manual' }],
  ['contact missing', { email: '', phone: '' }],
] as const) check((await request('POST', { ...recovery, ...patch })).status === 400, `recovery ${label}: rejected`);
check(count() === beforeRecovery, 'invalid recovery does not leave data');
const concurrent = await Promise.all([request('POST', recovery), request('POST', recovery)]);
check(concurrent.every((response) => response.status === 303) && concurrent.filter((response) => response.headers.get('location')?.endsWith('?ok=erfasst')).length === 1, 'simultaneous recovery submissions create once and open the existing record once');
const recovered = row(recoveryId)!;
check(recovered.id === recoveryId && recovered.created_at === '2026-10-01T08:15:30.125Z' && recovered.updated_at !== recovered.created_at && recovered.email_normalized === 'recovery@example.test', 'recovery retains normalized original UUID and exact original received instant');
const recoveryEvents = events().filter((event) => event.lead_id === recoveryId);
const provenance = JSON.parse(String(recoveryEvents[0].meta));
check(recoveryEvents.length === 1 && provenance.channel === 'recovery' && provenance.original_source === 'aquafacial-microneedling-lp' && provenance.original_reference === recoveryId && String(recoveryEvents[0].at) > String(recovered.created_at), 'recovery audit retains provenance and the later staff entry time');
const detailResponse = await worker.fetch(new Request(`http://localhost/admin/leads/${recoveryId}/`), env(), ctx);
const detailBody = await detailResponse.text();
check(detailResponse.status === 200 && detailBody.includes('Anfrage manuell erfasst') && detailBody.includes('Aus Benachrichtigungs-E-Mail wiederhergestellt') && detailBody.includes('1.10.2026, 10:15'), 'recovered detail distinguishes staff recovery from original receipt time');
check(detailBody.includes('Keine Einwilligung erfasst') && !detailBody.includes('id="h-revenue"') && !detailBody.includes('Die Zustellung ist unklar.'), 'recovered detail makes no consent, revenue or mail-delivery claims');
async function leadAction(action: string, fields: Record<string, string>) {
  return worker.fetch(new Request(`http://localhost/admin/leads/${whatsappId}/${action}/`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Sec-Fetch-Site': 'same-origin' },
    body: new URLSearchParams({ _csrf: csrf, ...fields }).toString(),
  }), env(), ctx);
}
check((await leadAction('contacted', {})).status === 303 && row(whatsappId)?.status === 'kontaktiert', 'manually captured enquiry supports contact attempt/status');
check((await leadAction('appointment', { date: '2026-11-03', time: '14:30', set_status: 'gebucht' })).status === 303
  && row(whatsappId)?.appointment_at === '2026-11-03T13:30:00.000Z' && row(whatsappId)?.status === 'gebucht', 'manual enquiry can be booked with a Zurich appointment time');
check((await leadAction('status', { status: 'erschienen', note: 'Fixture outcome only' })).status === 303 && row(whatsappId)?.status === 'erschienen', 'manual enquiry can record the actual attended outcome');
check((await leadAction('notes', { notes: 'Fixture staff handover' })).status === 303 && row(whatsappId)?.notes === 'Fixture staff handover', 'manual enquiry supports subsequent internal notes');
// Collision with an existing website reference must preserve the original, whatever its source.
db._db.prepare("UPDATE leads SET source = 'kontakt-page' WHERE id = ?").run(entryId);
const beforeCollision = count();
const collision = await request('POST', { ...recovery, original_reference: entryId });
check(collision.status === 303 && count() === beforeCollision, 'recovery of an existing website UUID cannot overwrite or duplicate it');

const atomicId = crypto.randomUUID();
const beforeAtomic = count();
db._db.exec("CREATE TRIGGER fail_manual_audit BEFORE INSERT ON lead_events BEGIN SELECT RAISE(ABORT, 'private Synthetic Phone 079 123 private@example.test'); END;");
check((await request('POST', { ...valid, entry_id: atomicId })).status === 500, 'audit failure reports failure');
check(!row(atomicId) && count() === beforeAtomic, 'audit failure rolls back lead and event together');
db._db.exec('DROP TRIGGER fail_manual_audit;');
db._db.exec("CREATE TRIGGER fail_manual_lead BEFORE INSERT ON leads BEGIN SELECT RAISE(ABORT, 'synthetic lead failure'); END;");
check((await request('POST', { ...valid, entry_id: atomicId })).status === 500 && count() === beforeAtomic, 'lead failure cannot leave an orphan event');
db._db.exec('DROP TRIGGER fail_manual_lead;');
check((await request('POST', { ...valid, entry_id: atomicId })).status === 303, 'same form ID can be retried after a rolled-back failure');
check(errors.length === 2 && errors.every((error) => !error.includes('079 123') && !error.includes('Synthetic Phone') && !error.includes('private@example.test')),
  'only expected storage failures are logged, without raw driver/form contact details');
check(network.length === 0 && background.length === 0, 'all manual/recovery paths make no network calls and schedule no work');
check(!form.body.includes('<script') && !/\son[a-z]+=/i.test(form.body), 'manual form works without scripts or inline handlers');
if (failures) process.exit(1);
console.log(`[ok] manual enquiry harness passed (${checks} checks)`);
