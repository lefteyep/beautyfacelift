// Harness for the lead cockpit pages and actions under /admin/leads/ (npm run harness:leads-cockpit).
// Runs the real Worker entry (worker/index.ts) against an in-memory D1 (fake-d1.mjs) with the real
// migrations; leads are created with the real createLeadFromSubmission. Identity: the local dev bypass
// (ENVIRONMENT=development, LEADS_DEV_EMAIL, host localhost). globalThis.fetch fails on any call.
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import worker from '../../worker/index.ts';
import { createLeadFromSubmission, type LeadSubmission } from '../../worker/leads/ingest.ts';
import { whatsappPrefillText } from '../../shared/leads.ts';
import { isoWeek, zurichToUtc } from '../../worker/leads/time.ts';

type Row = Record<string, unknown>;
type FakeD1 = ReturnType<typeof createFakeD1>;
type WorkerEnv = Parameters<typeof worker.fetch>[1];
type WorkerCtx = Parameters<typeof worker.fetch>[2];

const migrationsDir = fileURLToPath(new URL('../../worker/migrations/', import.meta.url));
const BASE = 'http://localhost';

let failures = 0;
function check(condition: unknown, label: string, detail?: unknown): void {
  if (condition) {
    console.log(`[ok] ${label}`);
  } else {
    failures += 1;
    console.log(`[fail] ${label}${detail === undefined ? '' : ` — got ${JSON.stringify(detail)}`}`);
  }
}

const fetchCalls: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  fetchCalls.push(url);
  throw new Error(`Harness: unexpected fetch to ${url}`);
}) as typeof fetch;

const logged: string[] = [];
console.error = (...args: unknown[]) => logged.push(`error: ${args.map(String).join(' ')}`);
console.warn = (...args: unknown[]) => logged.push(`warn: ${args.map(String).join(' ')}`);

// ---- database and seed ---------------------------------------------------------------------------
const db = createFakeD1({ migrationsDir });

const blank: LeadSubmission = {
  name: '', email: '', phone: '', preferredContactMethod: '', preferredCallbackTime: '', preferredDate: '', topic: '',
  message: '', source: '', marketingConsent: '', campaign: '', offer: '', treatment: '', landingPage: '', pageUrl: '',
  referrer: '', skinConcern: '', utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', fbclid: '',
  gclid: '', msclkid: '',
};

async function seed(fields: Partial<LeadSubmission>, minutesAgo: number): Promise<string> {
  const lead = await createLeadFromSubmission({ LEADS_DB: db } as never, { ...blank, ...fields }, new Date(Date.now() - minutesAgo * 60_000));
  if (!lead) throw new Error('seed failed');
  return lead.id;
}

const XSS_NAME = '<script>alert(1)</script> Kombi';
const comboId = await seed({
  name: XSS_NAME,
  email: 'kombi@example.test',
  campaign: 'aquafacial_microneedling',
  offer: 'aquafacial_microneedling_kombi',
  landingPage: '/lp/aquafacial-microneedling/',
  utmSource: 'facebook',
  utmContent: 'ad-<b>x</b>',
  message: 'Zeile eins\nZeile zwei',
}, 30);
const phoneId = await seed({
  name: 'Bea Telefon',
  phone: '079 123 45 67',
  email: 'bea@example.test',
  treatment: 'Aquafacial',
  topic: 'Ich möchte einen Termin buchen',
  source: 'kontakt-page',
  marketingConsent: 'yes',
}, 10);
const testId = await seed({ name: 'Carla Testeintrag', email: 'carla@example.test' }, 5);
db._db.prepare("UPDATE leads SET exclude = 'test' WHERE id = ?").run(testId);

const lead = (id: string) => db._db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as Row;
const events = (id: string, type?: string) =>
  (db._db.prepare(`SELECT * FROM lead_events WHERE lead_id = ?${type ? ' AND type = ?' : ''} ORDER BY id`).all(...(type ? [id, type] : [id])) as Row[]);

// ---- worker plumbing -----------------------------------------------------------------------------------
const assets = { async fetch() { return new Response('asset', { status: 200 }); } };
function makeEnv(overrides: Record<string, unknown> = {}): WorkerEnv {
  return {
    ASSETS: assets,
    ENVIRONMENT: 'development',
    LEADS_DEV_EMAIL: 'mediapaulo@gmail.com',
    LEADS_SIGNING_SECRET: 'test-secret',
    LEADS_DB: db,
    ...overrides,
  } as unknown as WorkerEnv;
}
const ctx = { waitUntil() {}, passThroughOnException() {}, props: {} } as unknown as WorkerCtx;

async function get(path: string, env = makeEnv()) {
  const response = await worker.fetch(new Request(`${BASE}${path}`), env, ctx);
  return { status: response.status, body: await response.text(), headers: response.headers };
}

async function post(path: string, fields: Record<string, string>, { headers = { 'Sec-Fetch-Site': 'same-origin' } as Record<string, string>, env = makeEnv() } = {}) {
  const response = await worker.fetch(new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams(fields).toString(),
  }), env, ctx);
  return { status: response.status, body: await response.text(), location: response.headers.get('location') };
}

const detailPath = (id: string) => `/admin/leads/${id}/`;
const actionPath = (id: string, action: string) => `/admin/leads/${id}/${action}/`;
const kpi = (body: string, label: string) => body.match(new RegExp(`<dt>${label}</dt><dd>([^<]*)</dd>`))?.[1];
const allPages: string[] = [];

// ---- 1. list ------------------------------------------------------------------------------------------
{
  const list = await get('/admin/leads/');
  allPages.push(list.body);
  check(list.status === 200, '1 list: 200', list.status);
  check(list.body.includes('Bea Telefon') && list.body.includes('&lt;script&gt;alert(1)&lt;/script&gt; Kombi'), '1 list (offen): shows the two open leads');
  check(!list.body.includes('Carla Testeintrag'), '1 list (offen): hides the lead excluded as test');
  check(!list.body.includes('<script'), '1 list: the raw "<script" never appears (escaped name, no JS)');
  check(/Diese Woche \(KW \d{1,2}\)/.test(list.body), '1 list: KPI strip "Diese Woche (KW n)"');
  check(kpi(list.body, 'Neu') === '2' && kpi(list.body, 'Kontaktiert') === '0' && kpi(list.body, 'Termin-Quote') === '0 %',
    '1 list: KPIs Neu 2, Kontaktiert 0, Termin-Quote 0 % (excluded lead not counted)', [kpi(list.body, 'Neu'), kpi(list.body, 'Termin-Quote')]);
  check(list.body.includes('>Kombi</span>') && list.body.includes('>Kontakt</span>') && list.body.includes('>Neu</span>'), '1 list: source and status chips');
  check(list.body.includes('href="tel:+41791234567"') && list.body.includes('href="https://wa.me/41791234567?text='), '1 list: Anrufen and WhatsApp for the lead with a phone');
  check(list.body.includes('aria-current="page">Offen</a>'), '1 list: "Offen" is the active filter chip');
  check(list.body.indexOf('Bea Telefon') < list.body.indexOf('alert(1)'), '1 list: newest first');

  const all = await get('/admin/leads/?status=alle');
  check(all.status === 200 && all.body.includes('Carla Testeintrag') && all.body.includes('Bea Telefon') && all.body.includes('alert(1)'), '2 ?status=alle: shows all three');
  check(all.body.includes('chip-muted">Test</span>'), '2 ?status=alle: the excluded lead carries a "Test" chip');

  const search = await get('/admin/leads/?q=079');
  check(search.body.includes('Bea Telefon') && !search.body.includes('alert(1)'), '3 ?q=079: finds the phone lead only');
  const searchIntl = await get(`/admin/leads/?q=${encodeURIComponent('+41 79 123')}`);
  check(searchIntl.body.includes('Bea Telefon'), '3 ?q=+41 79 123: finds the phone lead through phone_normalized');
  const searchMail = await get('/admin/leads/?q=KOMBI%40example');
  check(searchMail.body.includes('alert(1)') && !searchMail.body.includes('Bea Telefon'), '3 ?q=KOMBI@example: e-mail search, case-insensitive');
  const searchPercent = await get('/admin/leads/?q=%25');
  check(searchPercent.body.includes('Keine Anfragen in dieser Ansicht.'), '3 ?q=%: LIKE wildcards are escaped (empty state)');
  check(searchMail.body.includes('value="KOMBI@example"'), '3 search: the query stays in the search field');

  const campaign = await get('/admin/leads/?campaign=aquafacial_microneedling');
  check(campaign.body.includes('alert(1)') && !campaign.body.includes('Bea Telefon') && campaign.body.includes('Filter entfernen'), '4 ?campaign=: exact campaign filter');
  const neu = await get('/admin/leads/?status=gebucht');
  check(neu.body.includes('Keine Anfragen in dieser Ansicht.'), '4 ?status=gebucht: empty state');
}

// ---- 2. detail -----------------------------------------------------------------------------------------
let csrf = '';
{
  const detail = await get(detailPath(phoneId));
  allPages.push(detail.body);
  check(detail.status === 200, '5 detail: 200', detail.status);
  const prefill = encodeURIComponent(whatsappPrefillText('Bea', 'Aquafacial'));
  check(detail.body.includes(`href="https://wa.me/41791234567?text=${prefill}"`), '5 detail: WhatsApp link wa.me/41791234567 with the encoded prefill');
  check(detail.body.includes('href="tel:+41791234567"') && detail.body.includes('href="mailto:bea@example.test"'), '5 detail: Anrufen and E-Mail buttons');
  check(detail.body.includes('>Jetzt kontaktiert</button>'), '5 detail: "Jetzt kontaktiert" button');
  check(detail.body.includes('Anfrage eingegangen') && detail.body.includes('System'), '5 detail: timeline shows the created event by System');
  check(detail.body.includes('<dt>Marketing-Einwilligung</dt><dd>ja'), '5 detail: marketing consent ja');
  csrf = detail.body.match(/name="_csrf" value="([0-9a-f]{64})"/)?.[1] ?? '';
  check(csrf.length === 64, '5 detail: forms carry a 64-hex _csrf token', csrf);
  check((detail.body.match(/<form method="post"/g) ?? []).length === 6, '5 detail: six POST forms', (detail.body.match(/<form method="post"/g) ?? []).length);
  check((detail.body.match(/name="_csrf"/g) ?? []).length === 6, '5 detail: every POST form has _csrf');
  check(detail.body.includes('name="set_status" value="gebucht" checked'), '5 detail: "Status auf Gebucht setzen" checked while neu');

  const combo = await get(detailPath(comboId));
  allPages.push(combo.body);
  check(combo.status === 200 && combo.body.includes('<h1>&lt;script&gt;alert(1)&lt;/script&gt; Kombi</h1>') && !combo.body.includes('<script'),
    '6 detail with <script> in the name: escaped in the h1, never raw');
  check(!combo.body.includes('wa.me/') && combo.body.includes('href="mailto:kombi@example.test"'), '6 detail without phone: no WhatsApp/Anrufen, E-Mail only');
  check(combo.body.includes('ad-&lt;b&gt;x&lt;/b&gt;') && combo.body.includes('<dt>UTM Source</dt><dd>facebook</dd>') && !combo.body.includes('<dt>gclid</dt>'),
    '6 detail: UTM rows escaped, empty rows left out');
  check(combo.body.includes('<dd class="pre">Zeile eins\nZeile zwei</dd>'), '6 detail: message keeps its line break (pre-wrap)');
}

// ---- 3. contacted + CSRF -------------------------------------------------------------------------------------
{
  const noToken = await post(actionPath(phoneId, 'contacted'), {});
  check(noToken.status === 403 && noToken.body.includes('Ungültige Anfrage.'), '7 POST contacted without _csrf: 403 "Ungültige Anfrage."', noToken.status);
  const wrongToken = await post(actionPath(phoneId, 'contacted'), { _csrf: 'f'.repeat(64) });
  check(wrongToken.status === 403, '7 POST contacted with a wrong _csrf: 403', wrongToken.status);
  const crossSite = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf }, { headers: { 'Sec-Fetch-Site': 'cross-site' } });
  check(crossSite.status === 403, '8 POST contacted with _csrf but Sec-Fetch-Site cross-site: 403', crossSite.status);
  const typedUrl = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf }, { headers: { 'Sec-Fetch-Site': 'none' } });
  check(typedUrl.status === 403, '8 POST with Sec-Fetch-Site none: 403', typedUrl.status);
  const foreignOrigin = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf }, { headers: { Origin: 'https://evil.example' } });
  check(foreignOrigin.status === 403, '8 POST without Sec-Fetch-Site and a foreign Origin: 403', foreignOrigin.status);
  const noOrigin = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf }, { headers: {} });
  check(noOrigin.status === 403, '8 POST without Sec-Fetch-Site and without Origin: 403', noOrigin.status);
  check(lead(phoneId).contact_attempts === 0 && events(phoneId, 'contacted').length === 0, '7-8 refused posts changed nothing');

  const ok = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf });
  check(ok.status === 303 && ok.location === `/admin/leads/${phoneId}/?ok=kontaktiert`, '9 POST contacted (same-origin + _csrf): 303 to ?ok=kontaktiert', [ok.status, ok.location]);
  const first = lead(phoneId);
  check(typeof first.first_contact_at === 'string' && first.contact_attempts === 1 && first.status === 'kontaktiert', '9 contacted: first_contact_at set, attempts 1, status kontaktiert', first);
  check(first.status_changed_at === first.first_contact_at, '9 contacted: status_changed_at moved with neu → kontaktiert');
  const contacted = events(phoneId, 'contacted');
  check(contacted.length === 1 && contacted[0].actor === 'agentur' && contacted[0].from_status === 'neu' && contacted[0].to_status === 'kontaktiert',
    '9 contacted: one contacted event by agentur, neu → kontaktiert', contacted);

  const flash = await get(`${detailPath(phoneId)}?ok=kontaktiert`);
  allPages.push(flash.body);
  check(flash.body.includes('Als kontaktiert gespeichert.') && flash.body.includes('Erstkontakt') && flash.body.includes('1 Versuch'), '9 redirect target: flash and "Erstkontakt … · 1 Versuch"');
  check(flash.body.includes('name="set_status" value="gebucht" checked'), '9 detail: set_status still checked while kontaktiert');

  await new Promise((resolve) => setTimeout(resolve, 5));
  const second = await post(actionPath(phoneId, 'contacted'), { _csrf: csrf }, { headers: { Origin: BASE } });
  const after = lead(phoneId);
  check(second.status === 303 && after.contact_attempts === 2 && after.first_contact_at === first.first_contact_at && after.status === 'kontaktiert',
    '10 second contacted (Origin = own origin, no Sec-Fetch-Site): attempts 2, first_contact_at unchanged', after);
  check(events(phoneId, 'contacted').length === 2 && events(phoneId, 'contacted')[1].from_status === null, '10 second contacted: second event, no status change');
}

// ---- 4. appointment ---------------------------------------------------------------------------------------
{
  const november = await post(actionPath(phoneId, 'appointment'), { _csrf: csrf, date: '2026-11-03', time: '14:30', set_status: 'gebucht' });
  const booked = lead(phoneId);
  check(november.status === 303 && november.location?.endsWith('?ok=termin'), '11 POST appointment: 303 ?ok=termin', [november.status, november.location]);
  check(booked.appointment_at === '2026-11-03T13:30:00.000Z' && booked.status === 'gebucht', '11 appointment 2026-11-03 14:30 Zurich → 13:30Z, status gebucht', booked);
  const appointmentEvent = events(phoneId, 'appointment')[0] ?? {};
  check(appointmentEvent.from_status === 'kontaktiert' && appointmentEvent.to_status === 'gebucht'
    && JSON.parse(String(appointmentEvent.meta)).appointment_at === '2026-11-03T13:30:00.000Z', '11 appointment event: meta.appointment_at, kontaktiert → gebucht', appointmentEvent);

  const july = await post(actionPath(phoneId, 'appointment'), { _csrf: csrf, date: '2026-07-01', time: '14:30' });
  check(july.status === 303 && lead(phoneId).appointment_at === '2026-07-01T12:30:00.000Z' && lead(phoneId).status === 'gebucht', '12 appointment 2026-07-01 14:30 (summer time) → 12:30Z, status unchanged');

  const invalid = await post(actionPath(phoneId, 'appointment'), { _csrf: csrf, date: '2026-02-30', time: '10:00' });
  check(invalid.status === 400 && invalid.body.includes('Bitte prüfen Sie Datum und Uhrzeit.') && lead(phoneId).appointment_at === '2026-07-01T12:30:00.000Z',
    '13 appointment 2026-02-30: 400 with a message, row unchanged', invalid.status);
  check(invalid.body.includes('value="2026-02-30"') && invalid.body.includes('aria-invalid="true"'), '13 invalid appointment: the form keeps the input and marks it invalid');
  const missing = await post(actionPath(phoneId, 'appointment'), { _csrf: csrf, date: '', time: '' });
  check(missing.status === 400 && missing.body.includes('Bitte geben Sie Datum und Uhrzeit ein.'), '13 appointment without date: 400', missing.status);

  const termin = await get(`${detailPath(phoneId)}?ok=termin`);
  check(termin.body.includes('Aktueller Termin: 1.7.2026, 14:30') && termin.body.includes('value="2026-07-01"') && termin.body.includes('value="14:30"'),
    '14 detail shows the appointment in Zurich time');
}

// ---- 5. status ---------------------------------------------------------------------------------------------
{
  const eventsBefore = events(phoneId, 'status').length;
  const noNote = await post(actionPath(phoneId, 'status'), { _csrf: csrf, status: 'no_show', note: '  ' });
  check(noNote.status === 400 && noNote.body.includes('Bitte begründen Sie den Status «Nicht erschienen» kurz in der Notiz.'), '15 status no_show without note: 400 with the message', noNote.status);
  check(lead(phoneId).status === 'gebucht' && events(phoneId, 'status').length === eventsBefore, '15 status no_show without note: row and events unchanged');
  check(noNote.body.includes('value="no_show" checked'), '15 the re-rendered form keeps the chosen status');

  const unknown = await post(actionPath(phoneId, 'status'), { _csrf: csrf, status: 'verloren' });
  check(unknown.status === 400 && unknown.body.includes('Bitte wählen Sie einen Status.'), '16 unknown status: 400', unknown.status);

  const withNote = await post(actionPath(phoneId, 'status'), { _csrf: csrf, status: 'no_show', note: 'Kam nicht, <keine> Absage' });
  const row = lead(phoneId);
  const statusEvent = events(phoneId, 'status').at(-1) ?? {};
  check(withNote.status === 303 && withNote.location?.endsWith('?ok=status') && row.status === 'no_show', '17 status no_show with note: 303, status no_show', [withNote.status, row.status]);
  check(statusEvent.from_status === 'gebucht' && statusEvent.to_status === 'no_show' && statusEvent.note === 'Kam nicht, <keine> Absage' && statusEvent.actor === 'agentur',
    '17 status event: from_status gebucht, to_status no_show, note, actor agentur', statusEvent);
  const page = await get(`${detailPath(phoneId)}?ok=status`);
  allPages.push(page.body);
  check(page.body.includes('Status gespeichert.') && page.body.includes('Gebucht → Nicht erschienen') && page.body.includes('Kam nicht, &lt;keine&gt; Absage'),
    '17 timeline: from → to and the escaped note');
  check(page.body.includes('Agentur'), '17 timeline: actor shown as "Agentur"');
}

// ---- 6. revenue, notes, exclude -----------------------------------------------------------------------------------
{
  for (const bad of ['-5', 'abc', '100001', '12.50']) {
    const result = await post(actionPath(phoneId, 'revenue'), { _csrf: csrf, revenue_chf: bad, follow_up_booked: 'ja' });
    check(result.status === 400 && result.body.includes('Bitte geben Sie den Umsatz in ganzen Franken'), `18 revenue "${bad}": 400`, result.status);
  }
  const noChoice = await post(actionPath(phoneId, 'revenue'), { _csrf: csrf, revenue_chf: '170' });
  check(noChoice.status === 400, '18 revenue without follow_up_booked: 400', noChoice.status);
  check(lead(phoneId).revenue_first_visit_chf === null, '18 invalid revenue posts changed nothing');

  const revenue = await post(actionPath(phoneId, 'revenue'), { _csrf: csrf, revenue_chf: '170', follow_up_booked: 'ja' });
  check(revenue.status === 303 && revenue.location?.endsWith('?ok=umsatz') && lead(phoneId).revenue_first_visit_chf === 170 && lead(phoneId).follow_up_booked === 1,
    '19 revenue 170 + ja: revenue_first_visit_chf 170, follow_up_booked 1');
  const cleared = await post(actionPath(phoneId, 'revenue'), { _csrf: csrf, revenue_chf: '', follow_up_booked: 'unbekannt' });
  check(cleared.status === 303 && lead(phoneId).revenue_first_visit_chf === null && lead(phoneId).follow_up_booked === null, '19 empty revenue + unbekannt: both NULL');
  await post(actionPath(phoneId, 'revenue'), { _csrf: csrf, revenue_chf: '170', follow_up_booked: 'nein' });
  check(lead(phoneId).follow_up_booked === 0, '19 follow_up_booked nein → 0');

  const notes = await post(actionPath(phoneId, 'notes'), { _csrf: csrf, notes: 'Rückruf am Montag <b>wichtig</b>\r\nzweite Zeile' });
  check(notes.status === 303 && notes.location?.endsWith('?ok=notiz') && lead(phoneId).notes === 'Rückruf am Montag <b>wichtig</b>\nzweite Zeile', '20 notes saved (line breaks normalised)', lead(phoneId).notes);
  const notesPage = await get(`${detailPath(phoneId)}?ok=notiz`);
  check(notesPage.body.includes('Notizen gespeichert.') && notesPage.body.includes('Rückruf am Montag &lt;b&gt;wichtig&lt;/b&gt;') && !notesPage.body.includes('<b>wichtig'), '20 notes are escaped in the textarea');
  const tooLong = await post(actionPath(phoneId, 'notes'), { _csrf: csrf, notes: 'x'.repeat(4001) });
  check(tooLong.status === 400 && tooLong.body.includes('höchstens 4000 Zeichen') && String(lead(phoneId).notes).startsWith('Rückruf'), '20 notes over 4000 characters: 400, unchanged');

  const badExclude = await post(actionPath(phoneId, 'exclude'), { _csrf: csrf, exclude: 'maybe' });
  check(badExclude.status === 400 && badExclude.body.includes('Bitte wählen Sie eine Option.'), '21 exclude "maybe": 400', badExclude.status);
  const spam = await post(actionPath(phoneId, 'exclude'), { _csrf: csrf, exclude: 'spam' });
  check(spam.status === 303 && spam.location?.endsWith('?ok=ausschluss') && lead(phoneId).exclude === 'spam', '21 exclude spam: exclude = spam');
  const list = await get('/admin/leads/');
  check(!list.body.includes('Bea Telefon'), '21 the spam lead disappears from the default list');
  const all = await get('/admin/leads/?status=alle');
  check(all.body.includes('Bea Telefon') && all.body.includes('chip-muted">Spam</span>'), '21 ?status=alle shows it with a "Spam" chip');
  const none = await post(actionPath(phoneId, 'exclude'), { _csrf: csrf, exclude: 'none' });
  check(none.status === 303 && lead(phoneId).exclude === null, '21 exclude none: exclude NULL again');

  const cockpitEvents = events(phoneId).filter((event) => event.type !== 'created');
  check(cockpitEvents.length > 0 && cockpitEvents.every((event) => event.actor === 'agentur'), '22 every cockpit event is by actor agentur (LEADS_DEV_EMAIL = agency address)');
  check(['contacted', 'status', 'appointment', 'revenue', 'notes', 'exclude'].every((type) => events(phoneId, type).length > 0), '22 one event type per action');
  const notesEvent = events(phoneId, 'notes')[0] ?? {};
  check(notesEvent.note === null, '22 notes event does not copy the notes text', notesEvent);
}

// ---- 7. configuration and routing ---------------------------------------------------------------------------------
{
  const noSecret = makeEnv({ LEADS_SIGNING_SECRET: undefined });
  const before = lead(comboId).contact_attempts;
  const postNoSecret = await post(actionPath(comboId, 'contacted'), { _csrf: csrf }, { env: noSecret });
  check(postNoSecret.status === 503 && postNoSecret.body.includes('Konfiguration unvollständig.') && lead(comboId).contact_attempts === before, '23 LEADS_SIGNING_SECRET missing: POST 503, nothing written', postNoSecret.status);
  const getNoSecret = await get(detailPath(comboId), noSecret);
  check(getNoSecret.status === 200 && getNoSecret.body.includes('Änderungen werden nicht gespeichert') && getNoSecret.body.includes('name="_csrf" value=""'),
    '23 LEADS_SIGNING_SECRET missing: GET 200 with a notice, empty tokens');
  const listNoSecret = await get('/admin/leads/', noSecret);
  check(listNoSecret.status === 200, '23 LEADS_SIGNING_SECRET missing: list GET 200', listNoSecret.status);

  const unknownGet = await get(detailPath('does-not-exist'));
  check(unknownGet.status === 404 && unknownGet.body.includes('Nicht gefunden.'), '24 unknown id: GET 404', unknownGet.status);
  const unknownPost = await post(actionPath('does-not-exist', 'notes'), { _csrf: csrf, notes: 'x' });
  check(unknownPost.status === 404, '24 unknown id: POST 404', unknownPost.status);
  const badPath = await get('/admin/leads/a/b/c/');
  check(badPath.status === 404, '24 unknown cockpit path: 404', badPath.status);
  const getAction = await get(actionPath(phoneId, 'contacted'));
  check(getAction.status === 405, '25 GET on an action path: 405', getAction.status);
  const postList = await post('/admin/leads/', { _csrf: csrf });
  check(postList.status === 405, '25 POST on the list: 405', postList.status);

  const noDb = await get('/admin/leads/', makeEnv({ LEADS_DB: undefined }));
  check(noDb.status === 503 && noDb.body.includes('Datenbank nicht verbunden.'), '26 LEADS_DB missing: 503 "Datenbank nicht verbunden."', noDb.status);

  const brokenDb = { ...db, prepare() { throw new Error('D1_ERROR: simulated'); } } as unknown as FakeD1;
  const errorsBefore = logged.length;
  const broken = await get('/admin/leads/', makeEnv({ LEADS_DB: brokenDb }));
  check(broken.status === 500 && broken.body.includes('Etwas ist schiefgelaufen.') && logged.length === errorsBefore + 1 && logged.at(-1)?.startsWith('error: Lead cockpit failed:'),
    '27 D1 throws: branded 500 page, one console.error', broken.status);
  logged.splice(errorsBefore, 1);
}

// ---- 8. paging -----------------------------------------------------------------------------------------------
{
  const pagingDb = createFakeD1({ migrationsDir });
  const insert = pagingDb._db.prepare(`INSERT INTO leads (id, created_at, updated_at, source, name, status_changed_at) VALUES (?, ?, ?, 'manual', ?, ?)`);
  for (let index = 0; index < 51; index += 1) {
    const at = new Date(Date.UTC(2026, 9, 1, 8, index)).toISOString();
    insert.run(`p-${index}`, at, at, `Person ${String(index).padStart(2, '0')}`, at);
  }
  const env = makeEnv({ LEADS_DB: pagingDb });
  const first = await get('/admin/leads/', env);
  check((first.body.match(/class="row-name"/g) ?? []).length === 50 && first.body.includes('>Weiter</a>') && !first.body.includes('>Zurück</a>'), '28 page 1: 50 rows and "Weiter"');
  check(first.body.includes('href="/admin/leads/?page=2"'), '28 "Weiter" links to ?page=2');
  const second = await get('/admin/leads/?page=2', env);
  check((second.body.match(/class="row-name"/g) ?? []).length === 1 && second.body.includes('Person 00') && second.body.includes('>Zurück</a>'), '28 page 2: the oldest row and "Zurück"');
}

// ---- 9. Zurich time: ISO weeks at the year end and the DST switch ------------------------------------------------
// Expected values from the ISO 8601 rule, not from the code: weeks run Monday–Sunday and belong to the year of their
// Thursday; a year has 53 weeks when 1 January is a Thursday. 1.1.2026 is a Thursday (2026 is not a leap year, so
// 31.12.2026 is a Thursday too) → 2026 has week 53 = Mon 28.12.2026 – Sun 3.1.2027, which holds both 31.12.2026 and
// Fri 1.1.2027. Zurich is UTC+1 in winter, so the week's bounds are Sunday 23:00Z.
{
  const week53 = { year: 2026, week: 53, start: '2026-12-27T23:00:00.000Z', end: '2027-01-03T23:00:00.000Z' };
  for (const instant of ['2026-12-31T12:00:00.000Z', '2027-01-01T12:00:00.000Z', '2026-12-27T23:00:00.000Z', '2027-01-03T22:59:59.000Z']) {
    const week = isoWeek(new Date(instant));
    check(JSON.stringify(week) === JSON.stringify(week53), `29 isoWeek(${instant}) = 2026-W53, Mon 28.12. 00:00 – Mon 4.1. 00:00 Zurich`, week);
  }
  // Summer time ends on Sunday 25.10.2026 at 03:00 CEST → 02:00 CET. Week 43 (Mon 19.10. – Sun 25.10.) starts at
  // 00:00 CEST = 22:00Z on 18.10. and ends at Mon 26.10. 00:00 CET = 23:00Z on 25.10. (169 hours). 26.10.2026 is day 299
  // of the year; week 1 started Mon 29.12.2025 (day -2), so (299 - -2) / 7 = 43 full weeks before it → week 44.
  const week43 = { year: 2026, week: 43, start: '2026-10-18T22:00:00.000Z', end: '2026-10-25T23:00:00.000Z' };
  const week44 = { year: 2026, week: 44, start: '2026-10-25T23:00:00.000Z', end: '2026-11-01T23:00:00.000Z' };
  for (const [instant, expected] of [
    ['2026-10-25T00:30:00.000Z', week43], // 02:30 CEST, before the switch
    ['2026-10-25T22:59:59.000Z', week43], // Sunday 23:59:59 CET, last second of week 43
    ['2026-10-25T23:00:00.000Z', week44], // Monday 26.10. 00:00 CET
    ['2026-10-26T12:00:00.000Z', week44],
  ] as const) {
    const week = isoWeek(new Date(instant));
    check(JSON.stringify(week) === JSON.stringify(expected), `30 isoWeek(${instant}) = 2026-W${expected.week} with DST-correct bounds`, week);
  }
  check((Date.parse(week43.end) - Date.parse(week43.start)) / 3_600_000 === 169, '30 the DST-switch week is 169 hours long');
  // 29.3.2026: clocks jump from 02:00 CET to 03:00 CEST, so 02:30 does not exist; it maps forward to 03:30 CEST = 01:30Z.
  check(zurichToUtc('2026-03-29', '02:30') === '2026-03-29T01:30:00.000Z', '31 zurichToUtc 2026-03-29 02:30 (spring-forward gap) → 01:30Z', zurichToUtc('2026-03-29', '02:30'));
  check(zurichToUtc('2026-03-29', '03:30') === '2026-03-29T01:30:00.000Z' && zurichToUtc('2026-03-29', '01:30') === '2026-03-29T00:30:00.000Z',
    '31 zurichToUtc around the gap: 01:30 CET → 00:30Z, 03:30 CEST → 01:30Z');
}

// ---- 10. legacy mailto values cannot add recipients or parameters --------------------------------
{
  const legacy = await seed({ name: 'Legacy Mailbox', email: 'anna@example.test?bcc=other%40example.test' }, 1);
  const unsafe = await get(detailPath(legacy));
  check(unsafe.status === 200 && !unsafe.body.includes('href="mailto:'), '32 legacy URI-style mailbox is visible as data but has no clickable mailto');
  db._db.prepare('UPDATE leads SET email = ? WHERE id = ?').run('anna?subject=hello&bcc=other@example.test', legacy);
  const encoded = await get(detailPath(legacy));
  check(encoded.body.includes('href="mailto:anna%3Fsubject%3Dhello%26bcc%3Dother@example.test"') && !encoded.body.includes('href="mailto:anna?'),
    '32 valid URI characters in a local part are encoded in the cockpit contact link');
  allPages.push(unsafe.body, encoded.body);
}

// ---- general ---------------------------------------------------------------------------------------------------
check(allPages.every((page) => !/<script/i.test(page) && !/\son[a-z]+=/i.test(page)), 'no <script> and no inline event handlers on any cockpit page');
check(allPages.every((page) => !page.includes('ß')), 'no "ß" in the rendered pages');
check(fetchCalls.length === 0, 'no network calls', fetchCalls);
check(logged.length === 0, 'nothing logged to console.error / console.warn', logged);

if (failures > 0) {
  console.log(`[fail] ${failures} cockpit check(s) failed`);
  process.exit(1);
}
console.log('[ok] lead cockpit harness passed');
