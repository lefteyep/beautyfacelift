// Exercises the real authenticated Worker route. Synthetic D1, no live services or data.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import worker from '../../worker/index.ts';
import { createFakeD1 } from './fake-d1.mjs';
import { createLeadFromSubmission, type LeadSubmission } from '../../worker/leads/ingest.ts';
import type { Env } from '../../worker/env.ts';
import { CONTACT_EMAIL } from '../../shared/site.ts';

const db = createFakeD1({ migrationsDir: fileURLToPath(new URL('../../worker/migrations/', import.meta.url)) });
const path = 'http://localhost/admin/leads/data/erase/';
const agency = 'agency@example.test';
const target = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const logs: string[] = [];
const previousFetch = globalThis.fetch;
const previousInfo = console.info;
const previousError = console.error;
let network = 0;
globalThis.fetch = (async () => { network += 1; throw new Error('External services blocked'); }) as typeof fetch;
console.info = (...args) => logs.push(args.map(String).join(' '));
console.error = (...args) => logs.push(args.map(String).join(' '));
const settings = (extra: Partial<Env> = {}): Env => ({
  ASSETS: { async fetch() { return new Response('fixture asset'); } },
  ENVIRONMENT: 'development', LEADS_DEV_EMAIL: agency, LEADS_SIGNING_SECRET: 'synthetic-erasure-route-secret',
  LEADS_DB: db, LEADS_DATA_OPERATIONS: 'on', LEADS_DATA_OPERATORS: agency,
  PUBLIC_SUPABASE_URL: '', PUBLIC_SUPABASE_ANON_KEY: '', ...extra,
} as unknown as Env);
const ctx = { waitUntil() { throw new Error('No background work is allowed'); } } as unknown as Parameters<typeof worker.fetch>[2];
async function get(extra: Partial<Env> = {}, method = 'GET') { return worker.fetch(new Request(path, { method }), settings(extra), ctx); }
async function post(fields: Record<string, string>, extra: Partial<Env> = {}, site = 'same-origin') {
  return worker.fetch(new Request(path, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'sec-fetch-site': site }, body: new URLSearchParams(fields) }), settings(extra), ctx);
}
const value = (html: string, name: string) => html.match(new RegExp(`name="${name}" value="([^"]*)"`))?.[1] ?? '';
const count = () => Number((db._db.prepare('SELECT COUNT(*) AS n FROM leads').get() as {n: number}).n);
const base: LeadSubmission = {
  name: 'Synthetic Alpha', email: 'alpha@example.test', phone: '', preferredContactMethod: '', preferredCallbackTime: '', preferredDate: '', topic: '', message: '', source: 'kontakt-page', marketingConsent: '',
  campaign: '', offer: '', treatment: '', landingPage: '', pageUrl: '', referrer: '', skinConcern: '', utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', fbclid: '', gclid: '', msclkid: '',
};
try {
  await createLeadFromSubmission(settings(), base, new Date(), target);
  await createLeadFromSubmission(settings(), { ...base, name: 'Synthetic Beta', email: 'beta@example.test' }, new Date(), other);
  assert.equal((await get({ ENVIRONMENT: 'production', LEADS_DEV_EMAIL: undefined })).status, 401, 'real identity guard precedes operation route');
  assert.equal((await get({ LEADS_DATA_OPERATIONS: undefined })).status, 503, 'operator function absent/off by default');
  assert.equal((await get({ LEADS_DATA_OPERATORS: 'different@example.test' })).status, 403, 'ordinary allowed staff is not automatically a data operator');
  assert.equal((await get({ LEADS_DEV_EMAIL: CONTACT_EMAIL, LEADS_DATA_OPERATORS: CONTACT_EMAIL })).status, 403, 'studio access never inherits the agency erasure procedure');
  assert.equal((await get({ LEADS_SIGNING_SECRET: undefined })).status, 503);
  const head = await get({}, 'HEAD'); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  const page = await get(); assert.equal(page.status, 200);
  const html = await page.text(); const csrf = value(html, '_csrf'); assert.ok(csrf);
  assert.equal(count(), 2, 'GET/HEAD cannot erase anything');
  const fields = { _csrf: csrf, action: 'plan', lead_ids: target, case_ref: 'BFL-CASE-001' };
  assert.equal((await post({ ...fields, _csrf: '' })).status, 403);
  assert.equal((await post(fields, {}, 'cross-site')).status, 403);
  assert.equal((await post({ ...fields, lead_ids: `${target}\n${target}` })).status, 400);
  assert.equal((await post({ ...fields, case_ref: 'customer@example.test' })).status, 400);
  const preview = await post(fields); assert.equal(preview.status, 200);
  const previewBody = await preview.text(); const confirmation = value(previewBody, 'confirmation'); assert.ok(confirmation);
  assert.ok(!previewBody.includes(base.email) && !previewBody.includes(base.name), 'preview contains identifiers/counts, no copied contact payload');
  assert.equal(count(), 2, 'preview is read-only');
  const erase = { ...fields, action: 'erase', confirmation, typed_confirmation: 'LOESCHEN' };
  assert.equal((await post({ ...erase, typed_confirmation: '' })).status, 400);
  assert.equal(count(), 2);
  db._db.prepare("UPDATE leads SET notes = 'Unrelated staff change' WHERE id = ?").run(other);
  assert.equal((await post(erase)).status, 409, 'stale preview cannot authorize a changed snapshot');
  assert.equal(count(), 2);
  const nextBody = await (await post(fields)).text();
  const applied = await post({ ...erase, confirmation: value(nextBody, 'confirmation') });
  assert.equal(applied.status, 200);
  assert.match(await applied.text(), /wurden gelöscht/);
  assert.equal(count(), 1);
  assert.ok(db._db.prepare('SELECT id FROM leads WHERE id = ?').get(other));
  assert.equal(db._db.prepare('SELECT id FROM leads WHERE id = ?').get(target), undefined);
  assert.equal((db._db.prepare('SELECT COUNT(*) AS n FROM lead_events WHERE lead_id = ?').get(target) as {n: number}).n, 0);
  assert.ok(logs.some(line => line.includes('lead_erasure_completed') && line.includes('case_ref_hash')));
  assert.ok(!logs.join('\n').includes('BFL-CASE-001') && !logs.join('\n').includes(base.email) && !logs.join('\n').includes(base.name));
  assert.equal((await post(erase)).status, 409, 'repeat after deletion requires investigation, never a false success');
  const otherFields = { ...fields, lead_ids: other, case_ref: 'BFL-CASE-002' };
  const otherPreview = await (await post(otherFields)).text();
  const originalBatch = db.batch.bind(db);
  db.batch = async (statements) => { await originalBatch(statements); throw new Error('Synthetic response lost after commit'); };
  const uncertain = await post({ ...otherFields, action: 'erase', confirmation: value(otherPreview, 'confirmation'), typed_confirmation: 'LOESCHEN' });
  assert.equal(uncertain.status, 503, 'ambiguous commit response needs investigation');
  const uncertainBody = await uncertain.text();
  assert.match(uncertainBody, /Transaktion wurde nicht bestätigt/);
  assert.ok(!uncertainBody.includes('Es wurde nichts gelöscht'), 'unknown outcome cannot promise rollback');
  assert.equal(count(), 0, 'fixture proves the response can be lost after the actual commit');
  assert.equal(logs.filter(line => line.includes('lead_erasure_completed')).length, 1, 'no success audit is fabricated for an unconfirmed response');
  db.batch = originalBatch;
  assert.equal(network, 0);
  console.log('[ok] D1 operator route: identity/operator/gates/CSRF, read-only preview, explicit confirmation, stale rejection, exact erasure, safe audit');
} finally {
  globalThis.fetch = previousFetch; console.info = previousInfo; console.error = previousError;
}
