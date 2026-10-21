// Real local workerd/D1 SQL and batch semantics; isolated synthetic storage, no account credentials.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { planLeadErasure, executeLeadErasure, LeadErasureError } from '../../worker/leads/erasure.ts';

const mf = new Miniflare({
  host: '127.0.0.1', port: 0, cf: false, telemetry: { enabled: false },
  workers: [{ config: {
    name: 'synthetic-d1-drill', compatibilityDate: '2026-04-15',
    manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: 'export default {fetch(){return new Response("Synthetic local drill")}}' } } },
    env: { LEADS_DB: { type: 'd1', id: `synthetic-${crypto.randomUUID()}`, dev: { remote: false } } },
  } }],
});
try {
  const db = await mf.getD1Database('LEADS_DB');
  type Binding = Parameters<typeof planLeadErasure>[0];
  const binding = db as unknown as Binding;
  // This reviewed migration contains only CREATE TABLE/INDEX statements and line comments.
  // D1 exec splits on newlines, so prepare each complete statement instead.
  const migration = (await readFile(new URL('../../worker/migrations/0001_leads.sql', import.meta.url), 'utf8')).replace(/--[^\r\n]*/g, '');
  for (const statement of migration.split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  const target = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';
  const insert = 'INSERT INTO leads(id,created_at,updated_at,source,name,email,email_normalized,status_changed_at) VALUES (?,?,?,?,?,?,?,?)';
  for (const [id, name, email] of [[target, 'Synthetic Alpha', 'alpha@example.invalid'], [other, 'Synthetic Beta', 'beta@example.invalid']]) {
    await db.prepare(insert).bind(id, '2026-10-21T12:00:00Z', '2026-10-21T12:00:00Z', 'manual', name, email, email, '2026-10-21T12:00:00Z').run();
  }
  await db.prepare('UPDATE leads SET returning_of_lead_id = ? WHERE id = ?').bind(target, other).run();
  await db.prepare('INSERT INTO lead_events(lead_id,at,type,actor,meta) VALUES (?,?,?,?,?)').bind(target, '2026-10-21T12:00:00Z', 'created', 'system', null).run();
  await db.prepare('INSERT INTO lead_events(lead_id,at,type,actor,meta) VALUES (?,?,?,?,?)').bind(other, '2026-10-21T12:00:00Z', 'created', 'system', JSON.stringify({ returning_of_lead_id: target, channel: 'phone' })).run();
  const plan = await planLeadErasure(binding, [target]);
  assert.equal(plan.blockers.length, 0);
  assert.equal(plan.relationshipsCleared.length, 1);
  assert.equal(plan.metadataEventsRedacted.length, 1);
  assert.equal(await db.prepare('SELECT COUNT(*) AS n FROM leads').first('n'), 2, 'real D1 planning is read-only');
  const racedBinding = {
    prepare: db.prepare.bind(db),
    batch: async (statements: Parameters<typeof db.batch>[0]) => {
      await db.prepare("UPDATE leads SET notes = 'Synthetic concurrent change' WHERE id = ?").bind(other).run();
      return db.batch(statements);
    },
  } as unknown as Binding;
  await assert.rejects(() => executeLeadErasure(racedBinding, { leadIds: [target], apply: true, confirmation: plan.confirmation }), error => error instanceof LeadErasureError && error.code === 'transaction-failed');
  assert.ok(await db.prepare('SELECT id FROM leads WHERE id = ?').bind(target).first(), 'real D1 race rolls back the entire guarded batch');
  assert.equal(await db.prepare('SELECT returning_of_lead_id FROM leads WHERE id = ?').bind(other).first('returning_of_lead_id'), target);
  const refreshed = await planLeadErasure(binding, [target]);
  const result = await executeLeadErasure(binding, { leadIds: [target], apply: true, confirmation: refreshed.confirmation });
  assert.equal(result.mode, 'applied');
  assert.equal(await db.prepare('SELECT COUNT(*) AS n FROM leads').first('n'), 1);
  assert.equal(await db.prepare('SELECT COUNT(*) AS n FROM lead_events').first('n'), 1);
  assert.equal(await db.prepare('SELECT returning_of_lead_id FROM leads WHERE id = ?').bind(other).first('returning_of_lead_id'), null);
  assert.deepEqual(JSON.parse(await db.prepare('SELECT meta FROM lead_events WHERE lead_id = ?').bind(other).first('meta') as string), { channel: 'phone' });
  console.log('[ok] Local workerd/D1: actual schema/SQL limits, read-only plan, atomic race rollback, exact erasure and relationship/metadata cleanup');
} finally { await mf.dispose(); }
