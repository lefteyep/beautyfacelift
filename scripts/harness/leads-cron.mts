// Harness for the automatic lead e-mails and the Cron automations (npm run harness:leads-cron):
// the reminder to the studio (worker/cron/automations.ts), the customer confirmation
// (worker/email/confirmation.ts) and both entry points of worker/index.ts (scheduled, POST /api/contact).
// In-memory D1 (fake-d1.mjs) with the real migrations; leads are created with the real
// createLeadFromSubmission. The clock is passed in as `now`. globalThis.fetch is stubbed: Resend answers
// locally (200 or a chosen error status), Turnstile succeeds, any other URL fails the run.
// No e-mail leaves this machine; every address is @example.test.
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import worker from '../../worker/index.ts';
import { createLeadFromSubmission, type LeadSubmission } from '../../worker/leads/ingest.ts';
import { getLead, type LeadEventRow, type LeadRow } from '../../worker/leads/db.ts';
import { renderDetail } from '../../worker/leads/views/detail.ts';
import { runAutomations } from '../../worker/cron/automations.ts';
import { sendConfirmationIfDue } from '../../worker/email/confirmation.ts';
import { confirmationMail } from '../../worker/email/templates/confirmation.ts';
import { nudgeMail } from '../../worker/email/templates/nudge.ts';
import { SIGNATURE_LINE } from '../../worker/email/layout.ts';

type Row = Record<string, unknown>;
type FakeD1 = ReturnType<typeof createFakeD1>;
type WorkerEnv = Parameters<typeof worker.fetch>[1];
type WorkerCtx = Parameters<typeof worker.fetch>[2];
type WorkerController = Parameters<typeof worker.scheduled>[0];

const migrationsDir = fileURLToPath(new URL('../../worker/migrations/', import.meta.url));
const RESEND = 'https://api.resend.com/emails';
const AGENCY = 'agency@example.test';
const FROM = 'Beauty Face Lift <anfragen@example.test>';

let failures = 0;
function check(condition: unknown, label: string, detail?: unknown): void {
  if (condition) {
    console.log(`[ok] ${label}`);
  } else {
    failures += 1;
    console.log(`[fail] ${label}${detail === undefined ? '' : ` — got ${JSON.stringify(detail)}`}`);
  }
}

// ---- fetch stub ------------------------------------------------------------------------------------
type ResendCall = { from: string; to: string[]; reply_to: string[]; bcc?: string[]; subject: string; text: string; html: string; tags?: unknown };
const resendCalls: ResendCall[] = [];
const idempotencyKeys: (string | null)[] = [];
const otherCalls: string[] = [];
let resendStatus = 200;
let resendFailure: Error | null = null;
let resendPending: Promise<void> | null = null;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url === RESEND) {
    resendCalls.push(JSON.parse(String(init?.body ?? '{}')) as ResendCall);
    idempotencyKeys.push(new Headers(init?.headers).get('Idempotency-Key'));
    if (resendFailure) throw resendFailure;
    if (resendPending) await resendPending;
    if (resendStatus !== 200) return Response.json({ message: 'simulated failure' }, { status: resendStatus });
    return Response.json({ id: `re_${resendCalls.length}` }, { status: 200 });
  }
  otherCalls.push(url);
  if (url.startsWith('https://challenges.cloudflare.com/')) return Response.json({ success: true });
  throw new Error(`Harness: unexpected fetch to ${url}`);
}) as typeof fetch;

// Everything the code logs is collected; the harness prints only [ok]/[fail] lines.
const logged: string[] = [];
console.error = (...args: unknown[]) => logged.push(`error: ${args.map(String).join(' ')}`);
console.warn = (...args: unknown[]) => logged.push(`warn: ${args.map(String).join(' ')}`);
const print = console.log.bind(console);
function quiet<T>(work: () => Promise<T>): Promise<T> {
  const original = console.log;
  console.log = (...args: unknown[]) => logged.push(`log: ${args.map(String).join(' ')}`);
  return work().finally(() => {
    console.log = original;
  });
}
function takeLogged(): string[] {
  return logged.splice(0, logged.length);
}

// ---- database, env, seed -----------------------------------------------------------------------------
function newDb(): FakeD1 {
  return createFakeD1({ migrationsDir });
}

function makeEnv(db: FakeD1 | undefined, overrides: Record<string, unknown> = {}): WorkerEnv {
  return {
    ASSETS: { async fetch() { return new Response('asset', { status: 200 }); } },
    ENVIRONMENT: 'development',
    RESEND_API_KEY: 'test',
    CONTACT_FROM_EMAIL: FROM,
    CONTACT_TO_EMAIL: 'owner@example.test',
    LEADS_NUDGE_TO: AGENCY,
    LEADS_DB: db,
    ...overrides,
  } as unknown as WorkerEnv;
}

const blank: LeadSubmission = {
  name: '', email: '', phone: '', preferredContactMethod: '', preferredCallbackTime: '', preferredDate: '', topic: '',
  message: '', source: '', marketingConsent: '', campaign: '', offer: '', treatment: '', landingPage: '', pageUrl: '',
  referrer: '', skinConcern: '', utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', fbclid: '',
  gclid: '', msclkid: '',
};

async function seed(db: FakeD1, createdAt: string, fields: Partial<LeadSubmission> = {}): Promise<LeadRow> {
  const lead = await createLeadFromSubmission({ LEADS_DB: db } as never, {
    ...blank,
    name: 'Anna Muster',
    phone: '079 123 45 67',
    email: 'anna@example.test',
    topic: 'Ich möchte einen Termin buchen',
    ...fields,
  }, new Date(createdAt));
  if (!lead) throw new Error('seed failed');
  return lead;
}

const leadRow = (db: FakeD1, id: string) => db._db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as Row;
const events = (db: FakeD1, id: string, type: string) =>
  db._db.prepare('SELECT * FROM lead_events WHERE lead_id = ? AND type = ? ORDER BY id').all(id, type) as Row[];
const meta = (event: Row | undefined) => JSON.parse(String(event?.meta ?? '{}')) as Row;
const callsSince = (before: number) => resendCalls.length - before;

// Tue 20 Oct 2026 11:00 Zurich (CEST, UTC+2).
const TUE_1100 = new Date('2026-10-20T09:00:00.000Z');

// ---- 1. one nudge after 61 minutes, at most once ------------------------------------------------------------
{
  const db = newDb();
  const env = makeEnv(db);
  // Tue 09:59 Zurich: 61 minutes before the run (the brief's "08:59Z = 10:59" would be 1 minute; see the report).
  const due = await seed(db, '2026-10-20T07:59:00.000Z', { campaign: 'aquafacial_aktion', treatment: 'Aquafacial Aktion', message: 'x'.repeat(400) });
  const fresh = await seed(db, '2026-10-20T08:30:00.000Z', { name: 'Bea Neu', email: 'bea@example.test', phone: '078 111 22 33' });
  const excluded = await seed(db, '2026-10-20T07:00:00.000Z', { name: 'Carla Test', email: 'carla@example.test', phone: '' });
  db._db.prepare("UPDATE leads SET exclude = 'test' WHERE id = ?").run(excluded.id);

  const before = resendCalls.length;
  // Two invocations at the same moment (an overlapping or repeated Cron run): both see the lead as due,
  // only the one that wins claimAutomation may send.
  const [first, second] = await Promise.all([runAutomations(env, TUE_1100), runAutomations(env, TUE_1100)]);
  check(first.nudged.length + second.nudged.length === 1 && callsSince(before) === 1,
    '1 nudge: two runs at Tue 11:00 at the same time send exactly one reminder (the second run sends nothing)',
    { first, second, calls: callsSince(before) });
  const call = resendCalls[before];
  check(JSON.stringify(call?.to) === JSON.stringify([AGENCY]) && call?.from === FROM && !call?.bcc, '1 nudge: sent to LEADS_NUDGE_TO only, from CONTACT_FROM_EMAIL, no BCC', call && { to: call.to, from: call.from, bcc: call.bcc });
  check(JSON.stringify(call?.reply_to) === JSON.stringify([AGENCY]), '1 nudge: reply-to is the reminder recipient (never the studio inbox before go-live)', call?.reply_to);
  check(/^Noch offen: Anfrage von Anna Muster \(seit 61 Min\.\)$/.test(call?.subject ?? ''), '1 nudge: subject "Noch offen: Anfrage von Anna Muster (seit 61 Min.)"', call?.subject);
  const cockpitUrl = `https://beautyfacelift-zuerich.ch/admin/leads/${due.id}/`;
  check(call?.html.includes(`href="${cockpitUrl}"`) && call?.text.includes(`Im Lead-Cockpit öffnen: ${cockpitUrl}`), '1 nudge: cockpit link in HTML and text', cockpitUrl);
  check(call?.html.includes('href="tel:+41791234567"') && call?.html.includes('href="https://wa.me/41791234567?text=Guten%20Tag%20Anna%2C%20hier%20ist%20Teresa%20Stimac'),
    '1 nudge: one-tap Anrufen (tel:+41…) and WhatsApp (wa.me with the prefill)');
  check(call?.text.includes('Eingang: 20.10.2026, 09:59') && call?.text.includes('Quelle: Aquafacial') && call?.text.includes('Behandlung / Thema: Aquafacial Aktion'),
    '1 nudge: text names the arrival time (Zurich), source and treatment', call?.text);
  const messageLine = call?.text.split('\n').find((line) => line.startsWith('Nachricht: ')) ?? '';
  check(messageLine.length - 'Nachricht: '.length === 300 && messageLine.endsWith('…'), '1 nudge: message excerpt cut to 300 characters', messageLine.length);
  check(!/CHF|ß/.test(`${call?.html}${call?.text}${call?.subject}`), '1 nudge: no "CHF", no "ß"');
  const row = leadRow(db, due.id);
  check(row.nudge_sent_at === TUE_1100.toISOString(), '1 nudge: nudge_sent_at set to the run time', row.nudge_sent_at);
  const sent = events(db, due.id, 'nudge_sent');
  check(sent.length === 1 && sent[0]?.actor === 'system' && meta(sent[0]).to === 'LEADS_NUDGE_TO' && meta(sent[0]).id === 're_1' && !String(sent[0]?.meta).includes('@'),
    '1 nudge: one nudge_sent event (actor system, meta names the variable and the Resend id, no address)', sent);
  const detail = renderDetail({
    identity: { email: AGENCY, exp: 0, actor: 'agentur', dev: true },
    lead: await getLead(db as never, due.id) as LeadRow,
    events: sent as LeadEventRow[], csrf: null, flash: null,
  });
  check(!detail.includes('Die Zustellung ist unklar.'), '1 nudge: a successful-send event resolves the reservation without an uncertainty warning');

  const again = await runAutomations(env, TUE_1100);
  check(again.nudged.length === 0 && callsSince(before) === 1, '1 nudge: a later run at the same time sends nothing (1 Resend call in total)', { again, calls: callsSince(before) });
  check(leadRow(db, fresh.id).nudge_sent_at === null, '1 nudge: a lead created 30 minutes earlier is not nudged');
  check(leadRow(db, excluded.id).nudge_sent_at === null, '1 nudge: an excluded lead is not nudged');

  const later = await runAutomations(env, new Date('2026-10-20T09:31:00.000Z'));
  check(JSON.stringify(later.nudged) === JSON.stringify([fresh.id]) && leadRow(db, excluded.id).nudge_sent_at === null,
    '1 nudge: 31 minutes later the second lead is due (61 min) and nudged; the excluded lead still is not', later);

  // A lead the studio has answered is no longer "neu".
  const answered = await seed(db, '2026-10-20T07:00:00.000Z', { name: 'Dora Kontaktiert', email: 'dora@example.test', phone: '076 222 33 44' });
  db._db.prepare("UPDATE leads SET status = 'kontaktiert' WHERE id = ?").run(answered.id);
  const afterAnswer = await runAutomations(env, new Date('2026-10-20T10:00:00.000Z'));
  check(afterAnswer.nudged.length === 0, '1 nudge: a lead with status kontaktiert is not nudged', afterAnswer);
  check(takeLogged().length === 0, '1 nudge: nothing logged');
}

// ---- 2. opening hours: Sunday closed, Monday catches up (CET after the DST change) ---------------------------
{
  const db = newDb();
  const env = makeEnv(db);
  // Sat 24 Oct 15:00 Zurich (CEST): too late for a reminder before the 16:00 closing.
  const saturday = await seed(db, '2026-10-24T13:00:00.000Z');
  const before = resendCalls.length;
  const sunday = await runAutomations(env, new Date('2026-10-25T10:00:00.000Z'));
  check(sunday.skipped === 'closed' && sunday.nudged.length === 0 && callsSince(before) === 0, '2 hours: Sunday 11:00 (closed) → nothing sent, skipped "closed"', sunday);
  const mondayEarly = await runAutomations(env, new Date('2026-10-26T08:59:00.000Z'));
  check(mondayEarly.skipped === 'closed' && callsSince(before) === 0, '2 hours: Monday 08:59Z = 09:59 Zurich (CET) → still closed', mondayEarly);
  const monday = await runAutomations(env, new Date('2026-10-26T09:00:00.000Z'));
  check(monday.skipped === '' && JSON.stringify(monday.nudged) === JSON.stringify([saturday.id]) && callsSince(before) === 1,
    '2 hours: Monday 09:00Z = 10:00 Zurich (CET) → the Saturday lead is nudged', monday);
}

// ---- 3. Definite rejection → claim released, 2 h back-off; same provider key on retry ----------------
{
  const db = newDb();
  const env = makeEnv(db);
  const lead = await seed(db, '2026-10-20T08:00:00.000Z');
  const before = resendCalls.length;
  resendStatus = 429;
  const failed = await runAutomations(env, new Date('2026-10-20T10:00:00.000Z'));
  resendStatus = 200;
  check(failed.nudged.length === 0 && failed.errors === 1 && callsSince(before) === 1, '3 failure: Resend 429 → not nudged, errors 1', failed);
  check(leadRow(db, lead.id).nudge_sent_at === null, '3 failure: nudge_sent_at back to NULL (claim released)');
  const failedEvents = events(db, lead.id, 'mail_failed');
  check(failedEvents.length === 1 && meta(failedEvents[0]).kind === 'nudge' && meta(failedEvents[0]).delivery === 'rejected' && meta(failedEvents[0]).error === 'Resend request failed with status 429',
    '3 failure: one mail_failed event (kind nudge, the status in the error)', failedEvents);
  check(events(db, lead.id, 'nudge_sent').length === 0, '3 failure: no nudge_sent event');
  const oneHour = await runAutomations(env, new Date('2026-10-20T11:00:00.000Z'));
  check(oneHour.nudged.length === 0 && callsSince(before) === 1, '3 back-off: a run 1 h later sends nothing', oneHour);
  const threeHours = await runAutomations(env, new Date('2026-10-20T13:00:00.000Z'));
  check(JSON.stringify(threeHours.nudged) === JSON.stringify([lead.id]) && callsSince(before) === 2, '3 back-off: a run 3 h later sends the reminder', threeHours);
  check(idempotencyKeys[before] === `bfl:nudge:${lead.id}` && idempotencyKeys[before + 1] === idempotencyKeys[before],
    '3 retry: the same stable Idempotency-Key is sent as an HTTP header on both attempts');
  const logs = takeLogged();
  check(logs.length === 1 && logs[0] === 'error: Lead reminder failed: Resend request failed with status 429', '3 failure: one log line without address or body', logs);
}

// ---- 4. configuration missing --------------------------------------------------------------------------------
{
  const db = newDb();
  const lead = await seed(db, '2026-10-20T07:00:00.000Z');
  const second = await seed(db, '2026-10-20T07:30:00.000Z', { name: 'Eva Zweite', email: 'eva@example.test', phone: '077 333 44 55' });
  const before = resendCalls.length;

  const noRecipient = await runAutomations(makeEnv(db, { LEADS_NUDGE_TO: undefined }), TUE_1100);
  check(noRecipient.skipped === 'no-recipient' && callsSince(before) === 0, '4 config: LEADS_NUDGE_TO missing → nothing sent', noRecipient);
  check(leadRow(db, lead.id).nudge_sent_at === null && leadRow(db, second.id).nudge_sent_at === null, '4 config: LEADS_NUDGE_TO missing → no claim left behind');
  const noRecipientLogs = takeLogged();
  check(noRecipientLogs.length === 1 && noRecipientLogs[0]?.includes('LEADS_NUDGE_TO is missing'), '4 config: LEADS_NUDGE_TO missing → logged once', noRecipientLogs);

  const noFrom = await runAutomations(makeEnv(db, { CONTACT_FROM_EMAIL: undefined }), TUE_1100);
  check(noFrom.errors === 1 && noFrom.nudged.length === 0 && callsSince(before) === 0,
    '4 config: CONTACT_FROM_EMAIL missing → no request at all (no shared test sender), run stops after the first lead', noFrom);
  check(leadRow(db, lead.id).nudge_sent_at === null && leadRow(db, second.id).nudge_sent_at === null, '4 config: CONTACT_FROM_EMAIL missing → claims released');
  check(meta(events(db, lead.id, 'mail_failed')[0]).error === 'CONTACT_FROM_EMAIL is missing', '4 config: mail_failed names the missing setting');
  takeLogged();

  const noDb = await runAutomations(makeEnv(undefined), TUE_1100);
  check(noDb.skipped === 'no-db' && callsSince(before) === 0, '4 config: no LEADS_DB → skipped "no-db"', noDb);
}

// ---- 5. customer confirmation -----------------------------------------------------------------------------
const ON = { LEADS_CUSTOMER_MAILS: 'on' };
{
  const db = newDb();
  const lead = await seed(db, '2026-10-20T09:00:00.000Z', { name: 'Anna Muster', email: 'Anna@Example.test', preferredContactMethod: 'E-Mail' });
  const before = resendCalls.length;

  const off = await sendConfirmationIfDue(makeEnv(db), lead, TUE_1100);
  const offExplicit = await sendConfirmationIfDue(makeEnv(db, { LEADS_CUSTOMER_MAILS: 'off' }), lead, TUE_1100);
  const offCase = await sendConfirmationIfDue(makeEnv(db, { LEADS_CUSTOMER_MAILS: 'ON' }), lead, TUE_1100);
  check(JSON.stringify([off, offExplicit, offCase]) === JSON.stringify([{ skipped: 'off' }, { skipped: 'off' }, { skipped: 'off' }]) && callsSince(before) === 0,
    '5 confirmation: LEADS_CUSTOMER_MAILS unset, "off" or "ON" → skipped "off", no request', [off, offExplicit, offCase]);

  const sent = await sendConfirmationIfDue(makeEnv(db, ON), lead, TUE_1100);
  check('sent' in sent && callsSince(before) === 1, '5 confirmation: "on" → sent', sent);
  const call = resendCalls[before];
  check(JSON.stringify(call?.to) === JSON.stringify(['anna@example.test']) && JSON.stringify(call?.reply_to) === JSON.stringify(['info@beautyfacelift.ch']) && call?.from === FROM && !call?.bcc,
    '5 confirmation: to the customer only, reply-to the studio, from CONTACT_FROM_EMAIL', call && { to: call.to, reply_to: call.reply_to, from: call.from });
  check(call?.subject === 'Ihre Anfrage bei Beauty Face Lift', '5 confirmation: kontakt subject', call?.subject);
  check(call?.html.includes('href="https://beautyfacelift-zuerich.ch/termin/"') && call?.text.includes('Termin online buchen: https://beautyfacelift-zuerich.ch/termin/'),
    '5 confirmation: absolute booking link (HTML and text)');
  check(call?.html.includes('Diese E-Mail bestätigt den Eingang Ihrer Anfrage.') && call?.text.includes('Diese E-Mail bestätigt den Eingang Ihrer Anfrage.'), '5 confirmation: footer sentence');
  check(call?.text.includes('Teresa Stimac meldet sich persönlich bei Ihnen, in der Regel innerhalb eines Werktages, per E-Mail.'), '5 confirmation: personal-reply sentence names the preferred channel');
  check(call?.text.includes(SIGNATURE_LINE) && call?.text.includes('Montag bis Freitag 10:00 - 20:00') && call?.html.includes('Teresa Stimac · Beauty Face Lift · Bahnhofstrasse 94, 8001 Zürich · +41 79 214 34 62 · info@beautyfacelift.ch'),
    '5 confirmation: signature line and opening hours');
  check(!/CHF|ß|\/admin\/|resend\.dev|unsubscribe|abmelden/i.test(`${call?.html}${call?.text}${call?.subject}`), '5 confirmation: no "CHF", no "ß", no cockpit link, no opt-out');
  check(leadRow(db, lead.id).confirmation_sent_at === TUE_1100.toISOString(), '5 confirmation: confirmation_sent_at set');
  const mailSent = events(db, lead.id, 'mail_sent');
  check(mailSent.length === 1 && meta(mailSent[0]).kind === 'confirmation' && typeof meta(mailSent[0]).id === 'string' && !String(mailSent[0]?.meta).includes('@'),
    '5 confirmation: one mail_sent event (kind confirmation, Resend id, no address)', mailSent);

  const fresh = (await getLead(db as never, lead.id)) as LeadRow;
  const already = await sendConfirmationIfDue(makeEnv(db, ON), fresh, TUE_1100);
  // The caller's copy of the row is stale (confirmation_sent_at still NULL): only the claim stops a second send.
  const stale = await sendConfirmationIfDue(makeEnv(db, ON), lead, TUE_1100);
  check(JSON.stringify([already, stale]) === JSON.stringify([{ skipped: 'already' }, { skipped: 'already' }]) && callsSince(before) === 1,
    '5 confirmation: second call → "already" (also with a stale row: the claim stops it)', [already, stale]);

  const sameAddress = await seed(db, '2026-10-20T15:00:00.000Z', { name: 'Anna Muster', email: 'ANNA@example.test', phone: '' });
  const recent = await sendConfirmationIfDue(makeEnv(db, ON), sameAddress, new Date('2026-10-20T15:00:00.000Z'));
  check(JSON.stringify(recent) === JSON.stringify({ skipped: 'recent' }) && callsSince(before) === 1, '5 confirmation: same address within 24 h on a second lead → "recent"', recent);
  const dayLater = await sendConfirmationIfDue(makeEnv(db, ON), sameAddress, new Date('2026-10-21T09:01:00.000Z'));
  check('sent' in dayLater, '5 confirmation: the same address just over 24 h later → sent', dayLater);

  const noEmail = await seed(db, '2026-10-20T09:00:00.000Z', { name: 'Ohne Mail', email: '' });
  const excluded = await seed(db, '2026-10-20T09:00:00.000Z', { name: 'Spam Bot', email: 'bot@example.test' });
  db._db.prepare("UPDATE leads SET exclude = 'spam' WHERE id = ?").run(excluded.id);
  const skipNoEmail = await sendConfirmationIfDue(makeEnv(db, ON), noEmail, TUE_1100);
  const skipExcluded = await sendConfirmationIfDue(makeEnv(db, ON), (await getLead(db as never, excluded.id)) as LeadRow, TUE_1100);
  check(JSON.stringify([skipNoEmail, skipExcluded]) === JSON.stringify([{ skipped: 'no-email' }, { skipped: 'excluded' }]), '5 confirmation: no e-mail → "no-email"; excluded → "excluded"', [skipNoEmail, skipExcluded]);

  // Bots on the Turnstile-free ad pages must not turn the greeting ("Guten Tag {name}") into an advert.
  const linkName = await seed(db, '2026-10-20T09:00:00.000Z', { name: 'Besuchen Sie www.example.test', email: 'opfer@example.test', phone: '' });
  const suspiciousBefore = resendCalls.length;
  const suspicious = await sendConfirmationIfDue(makeEnv(db, ON), linkName, TUE_1100);
  check(JSON.stringify(suspicious) === JSON.stringify({ skipped: 'suspicious' }) && callsSince(suspiciousBefore) === 0 && leadRow(db, linkName.id).confirmation_sent_at === null,
    '5 confirmation: name "Besuchen Sie www.example.test" → "suspicious", no request, nothing claimed', suspicious);
  check(takeLogged().length === 0, '5 confirmation: nothing logged');
}

// ---- 6. anti-backscatter rate limit --------------------------------------------------------------------------
for (const [confirmedInLastHour, expected] of [[21, 'rate'], [20, 'rate'], [19, 'sent']] as const) {
  const db = newDb();
  for (let index = 0; index < confirmedInLastHour; index += 1) {
    const other = await seed(db, '2026-10-20T08:30:00.000Z', { name: `Bot ${index}`, email: `bot${index}@example.test`, phone: '' });
    db._db.prepare('UPDATE leads SET confirmation_sent_at = ? WHERE id = ?').run(`2026-10-20T08:${String(10 + index).padStart(2, '0')}:00.000Z`, other.id);
  }
  const lead = await seed(db, '2026-10-20T09:00:00.000Z', { name: 'Echte Kundin', email: 'echt@example.test' });
  const result = await sendConfirmationIfDue(makeEnv(db, ON), lead, TUE_1100);
  check(expected === 'rate' ? JSON.stringify(result) === JSON.stringify({ skipped: 'rate' }) : 'sent' in result,
    `6 rate: ${confirmedInLastHour} confirmations in the last hour → ${expected === 'rate' ? '"rate"' : 'sent'}`, result);
}

// ---- 7. confirmation send fails ----------------------------------------------------------------------------------
{
  const db = newDb();
  const lead = await seed(db, '2026-10-20T09:00:00.000Z');
  const before = resendCalls.length;
  resendStatus = 429;
  const result = await sendConfirmationIfDue(makeEnv(db, ON), lead, TUE_1100);
  resendStatus = 200;
  check(JSON.stringify(result) === JSON.stringify({ failed: 'Resend request failed with status 429' }) && callsSince(before) === 1, '7 failure: Resend 429 → "failed"', result);
  check(leadRow(db, lead.id).confirmation_sent_at === null, '7 failure: confirmation_sent_at NULL again');
  const failedEvents = events(db, lead.id, 'mail_failed');
  check(failedEvents.length === 1 && meta(failedEvents[0]).kind === 'confirmation' && meta(failedEvents[0]).delivery === 'rejected' && meta(failedEvents[0]).error === 'Resend request failed with status 429',
    '7 failure: one mail_failed event (kind confirmation)', failedEvents);
  check(events(db, lead.id, 'mail_sent').length === 0, '7 failure: no mail_sent event');
  const logs = takeLogged();
  check(logs.length === 1 && logs[0] === 'error: Lead confirmation failed: Resend request failed with status 429', '7 failure: one log line without address or body', logs);

  const noFrom = await sendConfirmationIfDue(makeEnv(db, { ...ON, CONTACT_FROM_EMAIL: undefined }), lead, TUE_1100);
  check(JSON.stringify(noFrom) === JSON.stringify({ failed: 'CONTACT_FROM_EMAIL is missing' }) && callsSince(before) === 1,
    '7 failure: CONTACT_FROM_EMAIL missing → "failed", no request (no shared test sender for customer mail)', noFrom);
  takeLogged();
}

// ---- 8. variants and the offer date ----------------------------------------------------------------------------------
{
  const base = { name: 'Anna Muster', treatment: '', topic: '', preferred_contact_method: '' };
  const combo = { ...base, campaign: 'aquafacial_microneedling', treatment: 'Aquafacial + Microneedling' };
  const offerSentence = 'Das Angebot gilt bis 14. November 2026.';
  const comboOct = confirmationMail(combo, TUE_1100);
  check(comboOct.subject === 'Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift', '8 combo: subject', comboOct.subject);
  check(comboOct.text.includes(offerSentence) && comboOct.html.includes(offerSentence), '8 combo on 2026-10-20: "Das Angebot gilt bis 14. November 2026."');
  check(comboOct.html.includes('href="https://beautyfacelift-zuerich.ch/termin/?service=Aquafacial+%2B+Microneedling"'), '8 combo: booking link with service "Aquafacial + Microneedling"');
  check(comboOct.text.includes('«Aquafacial + Microneedling Kombi-Angebot»') && comboOct.text.includes('per Telefon oder E-Mail.'), '8 combo: offer label and the default channel');
  const lastDay = confirmationMail(combo, new Date('2026-11-14T22:30:00.000Z'));
  check(lastDay.text.includes(offerSentence), '8 combo on 14 Nov 23:30 Zurich: still the offer sentence');
  const comboNov = confirmationMail(combo, new Date('2026-11-15T09:00:00.000Z'));
  check(!comboNov.text.includes('Das Angebot gilt') && !comboNov.html.includes('Das Angebot gilt'), '8 combo on 2026-11-15: no offer sentence');

  const aktion = confirmationMail({ ...base, campaign: 'aquafacial_aktion', treatment: 'Aquafacial Aktion', preferred_contact_method: 'WhatsApp' }, TUE_1100);
  check(aktion.subject === 'Ihre Aquafacial-Anfrage bei Beauty Face Lift' && !aktion.text.includes('Das Angebot gilt'), '8 aktion: subject, no end date (none on the page)', aktion.subject);
  check(aktion.html.includes('href="https://beautyfacelift-zuerich.ch/termin/?service=Aquafacial"') && aktion.text.includes('per WhatsApp.'), '8 aktion: booking link for "Aquafacial", channel WhatsApp');

  const xss = confirmationMail({ ...base, campaign: '', name: '<b>Eve</b> & Co', topic: 'Allgemeine Frage' }, TUE_1100);
  check(xss.html.includes('Guten Tag &lt;b&gt;Eve&lt;/b&gt; &amp; Co') && !xss.html.includes('<b>Eve'), '8 kontakt: the name is escaped in HTML');
  const all = [comboOct, comboNov, aktion, xss].map((mail) => `${mail.subject}${mail.html}${mail.text}`).join('');
  check(!/CHF|ß|\/admin\//.test(all), '8 variants: no "CHF", no "ß", no cockpit link');
}

// ---- 9. through worker/index.ts --------------------------------------------------------------------------------------
{
  const db = newDb();
  const due = await seed(db, '2026-10-20T07:59:00.000Z');
  const background: Promise<unknown>[] = [];
  const ctx = { waitUntil(promise: Promise<unknown>) { background.push(promise); }, passThroughOnException() {}, props: {} } as unknown as WorkerCtx;
  const controller = { scheduledTime: TUE_1100.getTime(), cron: '*/15 * * * *', noRetry() {} } as unknown as WorkerController;
  const before = resendCalls.length;
  let threw: unknown = null;
  await quiet(async () => {
    try {
      await worker.scheduled(controller, makeEnv(db), ctx);
      await Promise.all(background);
    } catch (error) {
      threw = error;
    }
  });
  check(threw === null && background.length === 1, '9 scheduled: runs without throwing and queues its work with ctx.waitUntil', String(threw));
  check(callsSince(before) === 1 && leadRow(db, due.id).nudge_sent_at === TUE_1100.toISOString(), '9 scheduled: uses controller.scheduledTime and sends the due reminder');
  const logs = takeLogged();
  check(logs.length === 1 && logs[0] === 'log: Lead automations: 1 reminder(s) sent, 0 failed', '9 scheduled: one summary log line, no address', logs);

  background.length = 0;
  await quiet(async () => {
    await worker.scheduled({ ...controller, scheduledTime: Date.parse('2026-10-25T10:00:00.000Z') } as WorkerController, makeEnv(undefined), ctx);
    await Promise.all(background);
  });
  check(takeLogged().length === 0, '9 scheduled: without LEADS_DB nothing happens and nothing is logged');

  // The contact route reads the clock itself (new Date()); a fixed clock (Tue 20 Oct 2026 11:00 Zurich,
  // before the combo offer ends) keeps these checks independent of the day the harness runs.
  const RealDate = Date;
  const FIXED_NOW = TUE_1100.getTime();
  class FixedDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(FIXED_NOW);
      else super(...(args as [string | number | Date]));
    }
    static now(): number {
      return FIXED_NOW;
    }
  }

  let ip = 0;
  async function postContact(env: WorkerEnv, email: string) {
    background.length = 0;
    ip += 1;
    globalThis.Date = FixedDate as DateConstructor;
    try {
      const response = await worker.fetch(new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': `198.51.100.${ip}` },
        body: JSON.stringify({
          name: 'Kim Kontakt', email, phone: '079 555 66 77', privacy_consent: 'yes',
          topic: 'Ich möchte einen Termin buchen', message: 'Kombi-Angebot, bitte um Rückruf.',
          campaign: 'aquafacial_microneedling', treatment: 'Aquafacial + Microneedling', landing_page: '/lp/aquafacial-microneedling/',
        }),
      }), env, ctx);
      const results = await Promise.all(background);
      return { status: response.status, results };
    } finally {
      globalThis.Date = RealDate;
    }
  }

  const onDb = newDb();
  const onBefore = resendCalls.length;
  const on = await postContact(makeEnv(onDb, ON), 'kim@example.test');
  const onCalls = resendCalls.slice(onBefore);
  check(on.status === 201 && on.results.length === 1 && 'sent' in (on.results[0] as object), '9 contact "on": 201, one waitUntil promise that sends the confirmation', on);
  check(onCalls.length === 2 && JSON.stringify(onCalls[0]?.to) === JSON.stringify(['owner@example.test']) && JSON.stringify(onCalls[1]?.to) === JSON.stringify(['kim@example.test']),
    '9 contact "on": 2 Resend calls (owner e-mail, then the confirmation to the customer)', onCalls.map((c) => c.to));
  check(onCalls[1]?.subject === 'Ihre Anfrage: Aquafacial + Microneedling bei Beauty Face Lift' && onCalls[1]?.text.includes('Das Angebot gilt bis 14. November 2026.'),
    '9 contact "on" (fixed clock 2026-10-20): combo subject and "Das Angebot gilt bis 14. November 2026."');
  const onLead = onDb._db.prepare('SELECT confirmation_sent_at FROM leads').get() as Row;
  check(onLead.confirmation_sent_at === TUE_1100.toISOString(), '9 contact "on": confirmation_sent_at = the fixed clock', onLead.confirmation_sent_at);
  check(!onCalls[0]?.html.includes('/admin/') && !onCalls[0]?.text.includes('/admin/'), '9 contact: the owner e-mail is unchanged (no cockpit link)');

  const offDb = newDb();
  const offBefore = resendCalls.length;
  const off = await postContact(makeEnv(offDb), 'lou@example.test');
  check(off.status === 201 && callsSince(offBefore) === 1 && JSON.stringify(off.results) === JSON.stringify([{ skipped: 'off' }]),
    '9 contact unset: 201, 1 Resend call (owner only), the queued confirmation resolves to "off"', { status: off.status, calls: callsSince(offBefore), results: off.results });
  const offLead = offDb._db.prepare('SELECT confirmation_sent_at FROM leads').get() as Row;
  check(offLead.confirmation_sent_at === null, '9 contact unset: confirmation_sent_at stays NULL');
  check(takeLogged().length === 0, '9 contact: nothing logged');
}

// ---- 10. atomic per-address/hourly limits include in-flight distinct leads -------------------------
{
  const db = newDb();
  const env = makeEnv(db, ON);
  const a = await seed(db, TUE_1100.toISOString(), { email: 'same@example.test' });
  const b = await seed(db, TUE_1100.toISOString(), { email: 'SAME@example.test' });
  const before = resendCalls.length;
  const results = await Promise.all([sendConfirmationIfDue(env, a, TUE_1100), sendConfirmationIfDue(env, b, TUE_1100)]);
  check(callsSince(before) === 1 && results.filter((result) => 'sent' in result).length === 1
    && results.filter((result) => 'skipped' in result && result.skipped === 'recent').length === 1,
  '10 concurrency: two distinct leads for one address reserve and send only once', results);
}
{
  const db = newDb();
  const env = makeEnv(db, ON);
  const leads: LeadRow[] = [];
  for (let index = 0; index < 30; index += 1) {
    leads.push(await seed(db, TUE_1100.toISOString(), { email: `concurrent${index}@example.test` }));
  }
  let release!: () => void;
  resendPending = new Promise<void>((resolve) => { release = resolve; });
  const before = resendCalls.length;
  const pending = Promise.all(leads.map((lead) => sendConfirmationIfDue(env, lead, TUE_1100)));
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(callsSince(before) === 20, '10 concurrency: exactly twenty deliveries may be in flight while provider responses are pending', callsSince(before));
  release();
  resendPending = null;
  const results = await pending;
  check(results.filter((result) => 'sent' in result).length === 20
    && results.filter((result) => 'skipped' in result && result.skipped === 'rate').length === 10,
  '10 concurrency: thirty distinct leads send twenty confirmations and skip ten');
  check(idempotencyKeys.slice(before).every((key) => key?.startsWith('bfl:confirmation:')),
    '10 confirmations: every automated send uses a stable provider Idempotency-Key');
}

// ---- 11. ambiguous acceptance never releases a reservation or automatically resends ---------------
for (const scenario of [
  { label: 'provider 500', status: 500, failure: null },
  { label: 'provider idempotency conflict', status: 409, failure: null },
  { label: 'accepted mail with lost response', status: 200, failure: new Error('simulated lost accepted response') },
  { label: 'request timeout', status: 200, failure: new DOMException('simulated timeout', 'TimeoutError') },
]) {
  const db = newDb();
  const env = makeEnv(db, ON);
  const lead = await seed(db, '2026-10-20T07:59:00.000Z');
  const before = resendCalls.length;
  resendStatus = scenario.status;
  resendFailure = scenario.failure;
  const first = await runAutomations(env, TUE_1100);
  resendStatus = 200;
  resendFailure = null;
  const retry = await runAutomations(env, new Date('2026-10-20T12:01:00.000Z'));
  const failure = events(db, lead.id, 'mail_failed')[0];
  check(first.errors === 1 && first.nudged.length === 0 && retry.nudged.length === 0 && callsSince(before) === 1,
    `11 nudge ${scenario.label}: one attempt, no automatic retry after back-off`, { first, retry, calls: callsSince(before) });
  check(leadRow(db, lead.id).nudge_sent_at === TUE_1100.toISOString() && meta(failure).delivery === 'uncertain' && meta(failure).retry === 'manual'
    && events(db, lead.id, 'nudge_sent').length === 0,
  `11 nudge ${scenario.label}: reservation retained, uncertainty recorded, no successful-send event`);
  check(idempotencyKeys[before] === `bfl:nudge:${lead.id}`, `11 nudge ${scenario.label}: provider key identifies the logical delivery`);
  const nudgeDetail = renderDetail({
    identity: { email: AGENCY, exp: 0, actor: 'agentur', dev: true },
    lead: await getLead(db as never, lead.id) as LeadRow,
    events: events(db, lead.id, 'mail_failed') as LeadEventRow[], csrf: null, flash: null,
  });
  check(nudgeDetail.includes('Erinnerung: Die Zustellung ist unklar.') && !nudgeDetail.includes('Erinnerung gesendet'),
    `11 nudge ${scenario.label}: cockpit distinguishes the reservation from a successful reminder`);
  takeLogged();

  const confirmation = await seed(db, TUE_1100.toISOString(), { email: 'uncertain@example.test' });
  const confirmationBefore = resendCalls.length;
  resendStatus = scenario.status;
  resendFailure = scenario.failure;
  const result = await sendConfirmationIfDue(env, confirmation, TUE_1100);
  resendStatus = 200;
  resendFailure = null;
  const repeated = await sendConfirmationIfDue(env, confirmation, TUE_1100);
  const sameAddress = await seed(db, TUE_1100.toISOString(), { email: 'uncertain@example.test' });
  const otherLead = await sendConfirmationIfDue(env, sameAddress, TUE_1100);
  const confirmationFailure = events(db, confirmation.id, 'mail_failed')[0];
  check('uncertain' in result && JSON.stringify(repeated) === JSON.stringify({ skipped: 'already' })
    && JSON.stringify(otherLead) === JSON.stringify({ skipped: 'recent' }) && callsSince(confirmationBefore) === 1,
  `11 confirmation ${scenario.label}: uncertainty prevents retries for this lead and the same address`, { result, repeated, otherLead });
  check(leadRow(db, confirmation.id).confirmation_sent_at === TUE_1100.toISOString() && meta(confirmationFailure).delivery === 'uncertain'
    && events(db, confirmation.id, 'mail_sent').length === 0,
  `11 confirmation ${scenario.label}: retained reservation is never reported as sent`);
  const html = renderDetail({
    identity: { email: AGENCY, exp: 0, actor: 'agentur', dev: true },
    lead: await getLead(db as never, confirmation.id) as LeadRow,
    events: events(db, confirmation.id, 'mail_failed') as LeadEventRow[],
    csrf: null,
    flash: null,
  });
  check(html.includes('E-Mail-Zustellung unklar') && html.includes('Es erfolgt kein automatischer Neuversand.') && !html.includes('E-Mail gesendet'),
    `11 confirmation ${scenario.label}: cockpit clearly shows uncertainty and the blocked automatic resend`);
  takeLogged();
}

// ---- 12. unsafe historical mailbox is displayed without a mailto action ---------------------------
{
  const db = newDb();
  const lead = await seed(db, TUE_1100.toISOString());
  const mail = nudgeMail({ ...lead, email: 'anna@example.test?bcc=other%40example.test' }, { minutesOpen: 60 });
  check(!mail.html.includes('href="mailto:'), '12 legacy mailbox in reminder has no unsafe mailto action');
  const encoded = nudgeMail({ ...lead, email: 'anna?subject=hello&bcc=other@example.test' }, { minutesOpen: 60 });
  check(encoded.html.includes('href="mailto:anna%3Fsubject%3Dhello%26bcc%3Dother@example.test"'),
    '12 valid local-part URI characters are percent-encoded in the reminder mailto');
}

// ---- general --------------------------------------------------------------------------------------------------------
check(otherCalls.length === 0, 'no request to anything but the stubbed Resend endpoint', otherCalls);
check(resendCalls.every((call) => [...call.to, ...(call.bcc ?? []), ...call.reply_to].every((address) => address.endsWith('@example.test') || address === 'info@beautyfacelift.ch')),
  'every recipient is an @example.test address (info@beautyfacelift.ch only as the confirmation reply-to)');
check(resendCalls.every((call) => !call.to.includes('info@beautyfacelift.ch')), 'nothing was addressed to info@beautyfacelift.ch');
const leftover = takeLogged();
check(leftover.length === 0, 'no unexpected log output', leftover);

if (failures > 0) {
  print(`[fail] ${failures} lead cron/mail check(s) failed`);
  process.exit(1);
}
print('[ok] lead cron and mail harness passed');
