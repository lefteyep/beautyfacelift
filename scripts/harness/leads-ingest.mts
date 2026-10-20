// Harness for the lead ingest in POST /api/contact (npm run harness:leads-ingest).
// Runs the real contactRoute against an in-memory D1 (fake-d1.mjs) with the real migrations.
// globalThis.fetch is stubbed: Turnstile and Resend answer locally, any other URL fails the run.
// No e-mail leaves this machine.
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import { contactRoute } from '../../worker/routes/contact.ts';
import { CONTACT_TOPICS } from '../../shared/site.ts';

type Row = Record<string, unknown>;
type FakeD1 = ReturnType<typeof createFakeD1>;

const migrationsDir = fileURLToPath(new URL('../../worker/migrations/', import.meta.url));
const TOPIC = CONTACT_TOPICS[0];
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

let failures = 0;
function check(condition: unknown, label: string, detail?: unknown): void {
  if (condition) {
    console.log(`[ok] ${label}`);
  } else {
    failures += 1;
    console.log(`[fail] ${label}${detail === undefined ? '' : ` — got ${JSON.stringify(detail)}`}`);
  }
}

// ---- fetch stub ---------------------------------------------------------------------------
const fetchCalls: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  fetchCalls.push(url);
  if (url.startsWith('https://challenges.cloudflare.com/')) return Response.json({ success: true });
  if (url === 'https://api.resend.com/emails') return Response.json({ id: 'fake' }, { status: 200 });
  throw new Error(`Harness: unexpected fetch to ${url}`);
}) as typeof fetch;

function resendCalls(): number {
  return fetchCalls.filter((url) => url === 'https://api.resend.com/emails').length;
}

// ---- env, ctx, requests -----------------------------------------------------------------------
const backgroundWork: Promise<unknown>[] = [];
const ctx = {
  waitUntil(promise: Promise<unknown>) {
    backgroundWork.push(promise);
  },
  passThroughOnException() {},
  props: {},
} as unknown as Parameters<typeof contactRoute>[2];

function makeEnv(leadsDb: FakeD1 | undefined) {
  return {
    RESEND_API_KEY: 'test',
    CONTACT_FROM_EMAIL: 'Beauty Face Lift <harness@example.test>',
    CONTACT_TO_EMAIL: 'owner@example.test',
    ENVIRONMENT: 'development',
    LEADS_DB: leadsDb,
  } as unknown as Parameters<typeof contactRoute>[1];
}

// The route rate-limits per IP (5 per 15 minutes); every request gets its own documentation IP.
let ipCounter = 0;
function nextIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function jsonRequest(body: Record<string, string>): Request {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': nextIp() },
    body: JSON.stringify(body),
  });
}

function formRequest(fields: Record<string, string>): Request {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'cf-connecting-ip': nextIp() },
    body: new URLSearchParams(fields).toString(),
  });
}

async function submit(request: Request, leadsDb: FakeD1 | undefined) {
  const resendBefore = resendCalls();
  const errors: unknown[][] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };
  try {
    const response = await contactRoute(request, makeEnv(leadsDb), ctx);
    return { response, errors, resend: resendCalls() - resendBefore };
  } catch (error) {
    // In production the Worker's API wrapper turns a thrown route into a 500; the checks then fail visibly.
    errors.push(['contactRoute threw:', error instanceof Error ? error.message : String(error)]);
    return { response: new Response(null, { status: 500 }), errors, resend: resendCalls() - resendBefore };
  } finally {
    console.error = originalError;
  }
}

function newDb(): FakeD1 {
  return createFakeD1({ migrationsDir });
}

function rows(db: FakeD1, sql: string, ...values: (string | number | null)[]): Row[] {
  return db._db.prepare(sql).all(...values) as Row[];
}

const kontaktSubmission = {
  name: 'Anna Muster',
  email: 'Anna.Muster@Example.TEST',
  phone: '079 123 45 67',
  preferred_contact: 'E-Mail',
  topic: TOPIC,
  message: 'Ich interessiere mich für eine Hautberatung.',
  privacy_consent: 'yes',
  source: 'kontakt-page',
};

const aquafacialLpSubmission = {
  name: 'Bea Beispiel',
  phone: '+41 79 765 43 21',
  email: 'bea@example.test',
  preferred_time: 'abends',
  privacy_consent: 'yes',
  privacyConsent: 'yes',
  campaign: 'aquafacial_aktion',
  offer: 'aquafacial_aktion_99',
  treatment: 'Aquafacial Aktion',
  landing_page: '/lp/aquafacial/',
  page_path: '/lp/aquafacial/',
  page_url: 'https://beautyfacelift-zuerich.ch/lp/aquafacial/?utm_source=facebook',
  utm_source: 'facebook',
  utm_content: 'ad-a',
  fbclid: 'fb.test',
};

// ---- 1. /kontakt/ JSON submission -----------------------------------------------------------
{
  const db = newDb();
  const { response, errors, resend } = await submit(jsonRequest(kontaktSubmission), db);
  check(response.status === 201, '1 kontakt JSON: 201', response.status);
  const leads = rows(db, 'SELECT * FROM leads');
  check(leads.length === 1, '1 kontakt JSON: one leads row', leads.length);
  const lead = leads[0] ?? {};
  check(lead.source === 'kontakt-page', '1 kontakt JSON: source kontakt-page', lead.source);
  check(lead.status === 'neu', '1 kontakt JSON: status neu', lead.status);
  check(lead.email === 'Anna.Muster@Example.TEST', '1 kontakt JSON: e-mail stored as entered', lead.email);
  check(lead.email_normalized === 'anna.muster@example.test', '1 kontakt JSON: e-mail normalised', lead.email_normalized);
  check(lead.phone_normalized === '41791234567', '1 kontakt JSON: phone normalised to 41…', lead.phone_normalized);
  check(lead.topic === TOPIC && lead.preferred_contact_method === 'E-Mail', '1 kontakt JSON: topic and contact method stored');
  check(
    typeof lead.created_at === 'string' && ISO_PATTERN.test(lead.created_at)
      && lead.updated_at === lead.created_at && lead.status_changed_at === lead.created_at,
    '1 kontakt JSON: created_at ISO, equal to updated_at and status_changed_at',
    [lead.created_at, lead.updated_at, lead.status_changed_at],
  );
  check(lead.returning_of_lead_id === null && lead.exclude === null, '1 kontakt JSON: not linked, not excluded');
  const events = rows(db, 'SELECT * FROM lead_events');
  check(events.length === 1, '1 kontakt JSON: one lead_events row', events.length);
  const event = events[0] ?? {};
  check(event.lead_id === lead.id && event.type === 'created' && event.actor === 'system', '1 kontakt JSON: event created by system', event);
  check(event.at === lead.created_at && event.to_status === 'neu', '1 kontakt JSON: event at created_at, to_status neu', event);
  const meta = JSON.parse(String(event.meta ?? '{}')) as Row;
  check(meta.source === 'kontakt-page' && meta.campaign === '' && !('returning_of_lead_id' in meta), '1 kontakt JSON: event meta', meta);
  check(resend === 1, '1 kontakt JSON: exactly one Resend call', resend);
  check(errors.length === 0, '1 kontakt JSON: nothing logged to console.error', errors);

  // ---- 3. same phone in another format within 30 days -> linked ------------------------------
  const { response: second } = await submit(jsonRequest({
    ...kontaktSubmission,
    email: 'someone.else@example.test',
    phone: '+41 79 123 45 67',
  }), db);
  check(second.status === 201, '3 duplicate: 201', second.status);
  const both = rows(db, 'SELECT id, returning_of_lead_id FROM leads ORDER BY created_at, rowid');
  check(both.length === 2, '3 duplicate: a second row, not an update', both.length);
  check(both[1]?.returning_of_lead_id === lead.id, '3 duplicate: returning_of_lead_id = first lead (phone 079… vs +41 79…)', both[1]);
  const secondEvent = rows(db, 'SELECT meta FROM lead_events WHERE lead_id = ?', String(both[1]?.id))[0] ?? {};
  check(JSON.parse(String(secondEvent.meta ?? '{}')).returning_of_lead_id === lead.id, '3 duplicate: event meta names the earlier lead', secondEvent);
}

// ---- 3b. a match older than 30 days is not linked ------------------------------------------------
{
  const db = newDb();
  const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  db._db.prepare(`INSERT INTO leads (id, created_at, updated_at, source, name, phone, phone_normalized, status_changed_at)
    VALUES ('old-lead', ?, ?, 'manual', 'Alt Kundin', '078 111 22 33', '41781112233', ?)`).run(old, old, old);
  const { response } = await submit(jsonRequest({ ...kontaktSubmission, email: 'neu@example.test', phone: '078 111 22 33' }), db);
  const lead = rows(db, "SELECT returning_of_lead_id FROM leads WHERE id <> 'old-lead'")[0] ?? {};
  check(response.status === 201 && lead.returning_of_lead_id === null, '3b duplicate window: a 31-day-old match is not linked', lead);
}

// ---- 3c. Swiss trunk "(0)" after the country code -> same number, linked ---------------------------
{
  const db = newDb();
  await submit(jsonRequest({ ...kontaktSubmission, email: 'erste@example.test', phone: '+41 (0) 79 222 33 44' }), db);
  await submit(jsonRequest({ ...kontaktSubmission, email: 'zweite@example.test', phone: '0041 (0)79 222 33 44' }), db);
  const pair = rows(db, 'SELECT id, phone_normalized, returning_of_lead_id FROM leads ORDER BY created_at, rowid');
  check(pair.length === 2 && pair.every((lead) => lead.phone_normalized === '41792223344'),
    '3c trunk zero: "+41 (0) 79 …" and "0041 (0)79 …" both normalise to 41792223344', pair);
  check(pair[1]?.returning_of_lead_id === pair[0]?.id, '3c trunk zero: the second enquiry links to the first', pair);
}

// ---- 3d. e-mail-only duplicate (no phone on either submission) ---------------------------------------
{
  const db = newDb();
  await submit(jsonRequest({ ...kontaktSubmission, email: 'Nur.Mail@example.test', phone: '' }), db);
  await submit(jsonRequest({ ...kontaktSubmission, email: 'nur.mail@EXAMPLE.test', phone: '' }), db);
  const pair = rows(db, 'SELECT id, phone_normalized, returning_of_lead_id FROM leads ORDER BY created_at, rowid');
  check(pair.length === 2 && pair.every((lead) => lead.phone_normalized === null), '3d e-mail only: two rows without phone', pair);
  check(pair[1]?.returning_of_lead_id === pair[0]?.id, '3d e-mail only: same e-mail (other case) links to the first lead', pair);
}

// ---- 2. /lp/aquafacial/ JSON without source -> aquafacial-lp ---------------------------------
{
  const db = newDb();
  const { response, resend } = await submit(jsonRequest(aquafacialLpSubmission), db);
  check(response.status === 201, '2 aquafacial LP: 201', response.status);
  const lead = rows(db, 'SELECT * FROM leads')[0] ?? {};
  check(lead.source === 'aquafacial-lp', '2 aquafacial LP: source aquafacial-lp from campaign', lead.source);
  check(lead.campaign === 'aquafacial_aktion' && lead.offer === 'aquafacial_aktion_99' && lead.treatment === 'Aquafacial Aktion', '2 aquafacial LP: campaign, offer, treatment stored');
  check(lead.landing_page === '/lp/aquafacial/' && lead.utm_source === 'facebook' && lead.utm_content === 'ad-a' && lead.fbclid === 'fb.test', '2 aquafacial LP: attribution stored');
  check(lead.topic === 'Ich möchte einen Termin buchen' && lead.preferred_callback_time === 'abends', '2 aquafacial LP: default topic and callback time stored');
  check(lead.phone_normalized === '41797654321', '2 aquafacial LP: +41 phone normalised', lead.phone_normalized);
  check(resend === 1, '2 aquafacial LP: exactly one Resend call', resend);
}

// ---- 2b. a public post cannot claim source=manual ---------------------------------------------------
{
  const db = newDb();
  const { response } = await submit(jsonRequest({ ...aquafacialLpSubmission, source: 'manual' }), db);
  const lead = rows(db, 'SELECT source FROM leads')[0] ?? {};
  check(response.status === 201 && lead.source === 'aquafacial-lp', '2b source=manual from a form: ignored, stored as aquafacial-lp (campaign)', lead);
}

// ---- 4. marketing consent ---------------------------------------------------------------------
{
  const db = newDb();
  await submit(jsonRequest({ ...kontaktSubmission, email: 'yes@example.test', phone: '', marketing_consent: 'yes' }), db);
  await submit(jsonRequest({ ...kontaktSubmission, email: 'no@example.test', phone: '' }), db);
  const withConsent = rows(db, "SELECT * FROM leads WHERE email_normalized = 'yes@example.test'")[0] ?? {};
  const without = rows(db, "SELECT * FROM leads WHERE email_normalized = 'no@example.test'")[0] ?? {};
  check(withConsent.marketing_consent === 1 && withConsent.marketing_consent_at === withConsent.created_at, '4 consent yes: marketing_consent 1, marketing_consent_at set', withConsent);
  check(without.marketing_consent === 0 && without.marketing_consent_at === null, '4 consent missing: marketing_consent 0, marketing_consent_at NULL', without);
  check(withConsent.phone === null && withConsent.phone_normalized === null, '4 no phone: phone and phone_normalized NULL');
}

// ---- 5. D1 failing -> the enquiry still goes out ------------------------------------------------
{
  const db = newDb();
  db.batch = async () => {
    throw new Error('D1_ERROR: simulated outage');
  };
  const { response, errors, resend } = await submit(jsonRequest(kontaktSubmission), db);
  check(response.status === 201, '5 D1 batch throws: still 201', response.status);
  check(resend === 1, '5 D1 batch throws: the owner e-mail is still sent', resend);
  check(errors.length === 1 && errors[0]?.[0] === 'Lead ingest failed:', '5 D1 batch throws: console.error called once with "Lead ingest failed:"', errors);
  check(rows(db, 'SELECT id FROM leads').length === 0, '5 D1 batch throws: no partial row');
}

// ---- 5b. real rollback: the event insert fails inside the batch ---------------------------------------
{
  const db = newDb();
  db._db.exec('DROP TABLE lead_events');
  const { response, errors, resend } = await submit(jsonRequest(kontaktSubmission), db);
  check(response.status === 201, '5b event insert fails: still 201', response.status);
  check(resend === 1, '5b event insert fails: the owner e-mail is still sent', resend);
  check(errors.length === 1 && errors[0]?.[0] === 'Lead ingest failed:', '5b event insert fails: console.error called once with "Lead ingest failed:"', errors);
  check(rows(db, 'SELECT id FROM leads').length === 0, '5b event insert fails: the lead insert is rolled back (0 rows)');
}

// ---- 6. no LEADS_DB bound -> as before, silently ------------------------------------------------
{
  const { response, errors, resend } = await submit(jsonRequest(kontaktSubmission), undefined);
  check(response.status === 201, '6 no LEADS_DB: 201', response.status);
  check(resend === 1, '6 no LEADS_DB: owner e-mail sent', resend);
  check(errors.length === 0, '6 no LEADS_DB: nothing logged', errors);
}

// ---- 7. form-encoded (HTML) submission ------------------------------------------------------------
{
  const db = newDb();
  const { response, resend } = await submit(formRequest({
    name: 'Clara Formular',
    email: 'clara@example.test',
    topic: TOPIC,
    message: 'Bitte um Rückruf.',
    privacy_consent: 'on',
    marketing_consent: 'on',
    source: 'kontakt-page',
  }), db);
  check(response.status === 303 && response.headers.get('location') === '/kontakt/danke/', '7 form POST: 303 to /kontakt/danke/', [response.status, response.headers.get('location')]);
  const lead = rows(db, 'SELECT * FROM leads')[0];
  check(lead?.source === 'kontakt-page' && lead?.email_normalized === 'clara@example.test', '7 form POST: lead row stored', lead);
  check(lead?.marketing_consent === 1, '7 form POST: checkbox "on" counts as marketing consent', lead?.marketing_consent);
  check(resend === 1, '7 form POST: exactly one Resend call', resend);
}

// ---- general ----------------------------------------------------------------------------------
// Each stored lead queues the customer confirmation with ctx.waitUntil; LEADS_CUSTOMER_MAILS is unset here,
// so every one resolves to "off" and no further e-mail is sent (worker/email/confirmation.ts).
const resendBeforeBackground = resendCalls();
const backgroundResults = await Promise.all(backgroundWork);
check(backgroundResults.length > 0 && backgroundResults.every((result) => JSON.stringify(result) === JSON.stringify({ skipped: 'off' })) && resendCalls() === resendBeforeBackground,
  'queued confirmations (ctx.waitUntil) all resolve to "off" without another e-mail (LEADS_CUSTOMER_MAILS unset)', backgroundResults);
check(fetchCalls.every((url) => url === 'https://api.resend.com/emails'), 'only the stubbed Resend endpoint was called (Turnstile is off on localhost)', fetchCalls);

if (failures > 0) {
  console.log(`[fail] ${failures} lead ingest check(s) failed`);
  process.exit(1);
}
console.log('[ok] lead ingest harness passed');
