// Real route + synthetic SQLite/D1; outbound services are replaced before any invocation.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import { contactRoute } from '../../worker/routes/contact.ts';
import { reportStorageFailure } from '../../worker/leads/storage-alert.ts';
import { createLeadFromSubmission, type LeadSubmission } from '../../worker/leads/ingest.ts';
import { runAutomations } from '../../worker/cron/automations.ts';
import { sendConfirmationIfDue } from '../../worker/email/confirmation.ts';
import type { Env } from '../../worker/env.ts';

const newDb = () => createFakeD1({ migrationsDir: fileURLToPath(new URL('../../worker/migrations/', import.meta.url)) });
type Mail = { to: string[]; text: string; html: string; tags?: {name: string; value: string}[] };
const calls: { body: Mail; key: string | null }[] = [];
const logs: string[] = [];
let alertFails = false;
let ownerFails = false;
let quotaRemaining = Infinity;
let ip = 0;
const originalFetch = globalThis.fetch;
const originalError = console.error;
console.error = (...args) => logs.push(args.map(String).join(' '));
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  assert.equal(String(input), 'https://api.resend.com/emails', 'no unexpected network destination');
  const body = JSON.parse(String(init?.body)) as Mail;
  calls.push({ body, key: new Headers(init?.headers).get('Idempotency-Key') });
  const isAlert = body.tags?.some(tag => tag.value === 'storage-alert');
  if (quotaRemaining-- <= 0) return new Response(null, { status: 429 });
  if (isAlert && alertFails) throw new Error('simulated provider acknowledgement loss');
  if (!isAlert && ownerFails) return new Response(null, { status: 503 });
  return Response.json({ id: 'synthetic-message' });
}) as typeof fetch;

function env(db?: ReturnType<typeof newDb>, extra: Partial<Env> = {}): Env {
  return {
    ENVIRONMENT: 'development', LEADS_DB: db, LEADS_CAPTURE: 'on',
    CONTACT_FROM_EMAIL: 'Agency <sender@example.test>', CONTACT_TO_EMAIL: 'owner@example.test', RESEND_API_KEY: 'synthetic',
    LEADS_ALERT_TO: 'agency@example.test', ACCESS_ALLOWED_EMAILS: 'agency@example.test', ...extra,
  } as Env;
}
const submission = {
  name: 'Private Fixture Person', phone: '079 123 45 67', email: 'private-fixture@example.test',
  topic: 'Ich möchte einen Termin buchen', message: 'Private fixture message, never in alert logs', privacyConsent: 'yes',
};
async function submit(settings: Env) {
  const background: Promise<unknown>[] = [];
  const response = await contactRoute(new Request('http://localhost/api/contact', {
    method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': `192.0.2.${++ip}` },
    body: JSON.stringify(submission),
  }), settings, { waitUntil: (work: Promise<unknown>) => background.push(work) } as unknown as Parameters<typeof contactRoute>[2]);
  await Promise.all(background);
  return response;
}
function reset() { calls.length = 0; logs.length = 0; alertFails = false; ownerFails = false; quotaRemaining = Infinity; }
const count = (db: ReturnType<typeof newDb>) => Number((db._db.prepare('SELECT COUNT(*) AS n FROM leads').get() as {n: number}).n);
const blank: LeadSubmission = {
  name: 'Fixture', email: 'fixture@example.test', phone: '', preferredContactMethod: '', preferredCallbackTime: '', preferredDate: '',
  topic: '', message: '', source: '', marketingConsent: '', campaign: '', offer: '', treatment: '', landingPage: '', pageUrl: '',
  referrer: '', skinConcern: '', utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', fbclid: '', gclid: '', msclkid: '',
};

try {
  {
    reset(); const db = newDb();
    assert.equal((await submit(env(db, { LEADS_CAPTURE: undefined }))).status, 201);
    assert.equal(count(db), 0, 'capture absent is off even with a bound database');
    assert.equal(calls.length, 1, 'only the existing owner mail is attempted');
    assert.equal(logs.length, 0);
    assert.match(calls[0].body.text, /Anfrage-ID: [0-9a-f-]{36}/);
  }
  {
    reset(); const db = newDb();
    assert.equal((await submit(env(db))).status, 201);
    const row = db._db.prepare('SELECT * FROM leads').get() as {id: string; created_at: string};
    assert.ok(row);
    assert.ok(calls[0].body.text.includes(`Anfrage-ID: ${row.id}`));
    assert.ok(calls[0].body.text.includes(`Eingang: ${row.created_at}`));
    assert.ok(calls[0].body.html.includes(row.id));
    assert.ok(calls[0].body.html.includes(row.created_at));
    assert.equal(calls.length, 1);
  }
  for (const missingDb of [false, true]) {
    reset(); const db = newDb();
    db.batch = async () => { throw new Error('SQL error including Private Fixture Person'); };
    assert.equal((await submit(env(missingDb ? undefined : db))).status, 201, 'storage outage preserves enquiry response');
    assert.equal(count(db), 0);
    const owner = calls.find(call => call.body.to.includes('owner@example.test'))!;
    const alert = calls.find(call => call.body.to.includes('agency@example.test'))!;
    assert.ok(owner && alert, 'owner and independent agency alert are both attempted');
    const reference = /Anfrage-ID: ([0-9a-f-]{36})/.exec(owner.body.text)![1];
    assert.ok(logs.some(line => line.includes(reference) && line.includes('lead_storage_failed')));
    for (const value of [submission.name, submission.email, submission.message, submission.phone]) {
      assert.ok(!logs.join('\n').includes(value), 'storage logs contain no submitted personal data');
      assert.ok(!alert.body.text.includes(value), 'alert mail contains no submitted personal data');
    }
  }
  {
    reset(); alertFails = true;
    assert.equal((await submit(env())).status, 201, 'lost alert acknowledgement cannot break owner mail/form');
    assert.ok(logs.some(line => line.includes('alert unconfirmed')));
  }
  {
    reset(); quotaRemaining = 1;
    assert.equal((await submit(env())).status, 201, 'last provider send slot belongs to owner, not the outage alert');
    assert.deepEqual(calls[0].body.to, ['owner@example.test']);
    assert.deepEqual(calls[1].body.to, ['agency@example.test']);
    assert.ok(logs.some(line => line.includes('alert unconfirmed')), 'exhausted alert quota is reported without failing owner receipt');
  }
  {
    reset(); const settings = env();
    await Promise.all(['first', 'second'].map((enquiryId, i) => reportStorageFailure(settings, {
      enquiryId, receivedAt: new Date(`2026-10-21T10:${i ? '45' : '01'}:00.000Z`), reason: 'write-failed',
    })));
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0], calls[1], 'same-hour alerts have identical payload and key for provider deduplication');
    assert.equal(calls[0].key, 'bfl:storage-alert:2026-10-21T10:00:00.000Z');
    await reportStorageFailure(settings, { enquiryId: 'third', receivedAt: new Date('2026-10-21T11:00:00Z'), reason: 'missing-db' });
    assert.notEqual(calls[2].key, calls[0].key, 'next hour is a separate operational signal');
  }
  for (const recipient of ['', 'customer@example.test', 'agency@example.test,customer@example.test']) {
    reset();
    await reportStorageFailure(env(undefined, { LEADS_ALERT_TO: recipient }), {
      enquiryId: 'fixture', receivedAt: new Date('2026-10-21T10:00:00Z'), reason: 'write-failed',
    });
    assert.equal(calls.length, 0, 'alerts never go to an absent, unallowed or multi-address recipient');
    assert.ok(logs.some(line => line.includes('unconfigured')));
  }
  {
    reset(); const db = newDb(); const now = new Date('2026-10-20T09:00:00Z');
    const manual = await createLeadFromSubmission(env(db), { ...blank, source: 'manual' }, new Date('2026-10-20T07:00:00Z'));
    assert.ok(manual);
    // Public ingestion intentionally rejects the reserved manual source. Model the protected
    // manual writer here; its own route/atomicity harness covers how this row is created.
    db._db.prepare("UPDATE leads SET source = 'manual' WHERE id = ?").run(manual.id);
    manual.source = 'manual';
    assert.equal((await runAutomations(env(db, { LEADS_NUDGE_TO: 'agency@example.test' }), now)).skipped, 'off');
    await runAutomations(env(db, { LEADS_REMINDERS: 'on', LEADS_NUDGE_TO: 'agency@example.test' }), now);
    assert.deepEqual(await sendConfirmationIfDue(env(db, { LEADS_CUSTOMER_MAILS: 'on' }), manual, now), { skipped: 'manual' });
    assert.equal(calls.length, 0, 'manual/recovered records cannot trigger reminders or customer confirmations');
    await createLeadFromSubmission(env(db), blank, new Date('2026-10-20T07:01:00Z'));
    assert.equal((await runAutomations(env(db, { LEADS_REMINDERS: 'on', LEADS_NUDGE_TO: 'agency@example.test' }), now)).nudged.length, 1);
  }
  {
    reset(); const db = newDb(); ownerFails = true;
    assert.equal((await submit(env(db))).status, 502);
    assert.equal(count(db), 1, 'persisted row and failed owner delivery remain distinguishable');
  }
  console.log('[ok] pilot readiness: explicit gates, common references, sanitized independent alerts, manual mail suppression, failure separation');
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalError;
}
