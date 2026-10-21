// D1-binding erasure checks with the real migration and synthetic SQLite-backed D1 only.
// Every external request is blocked. Run with node --disable-warning=ExperimentalWarning --import tsx scripts/harness/leads-erasure.mts.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';
import { executeLeadErasure, planLeadErasure, LeadErasureError, LEAD_ERASURE_LIMITS, type LeadErasureErrorCode } from '../../worker/leads/erasure.ts';

type Fake = ReturnType<typeof createFakeD1>;
type Row = Record<string, unknown>;
const A = '00000000-0000-4000-8000-000000000001';
const REPEAT = '00000000-0000-4000-8000-000000000002';
const B = '00000000-0000-4000-8000-000000000003';
const C = '00000000-0000-4000-8000-000000000004';
const TARGETS = [A, REPEAT];
const databases: Fake[] = [];
const network: string[] = [];
const logs: string[] = [];
const originalError = console.error;
console.error = (...args: unknown[]) => logs.push(args.map(String).join(' '));
globalThis.fetch = (async (input: RequestInfo | URL) => { network.push(String(input)); throw new Error('No network allowed'); }) as typeof fetch;
let checks = 0;
function check(value: unknown, label: string): void { checks++; assert.ok(value, label); console.log(`[ok] ${label}`); }
function same(actual: unknown, expected: unknown, label: string): void { checks++; assert.deepEqual(actual, expected, label); console.log(`[ok] ${label}`); }
async function fails(action: () => unknown, code: LeadErasureErrorCode, label: string): Promise<void> {
  let error: unknown;
  try { await action(); } catch (caught) { error = caught; }
  check(error instanceof LeadErasureError && error.code === code, `${label}: safe ${code}`);
  check(!/Alpha|alpha@|private|079123|CREATE TRIGGER|NOT NULL/.test(String(error)), `${label}: no raw driver/personal details`);
}
const rows = (db: Fake, table: string) => db._db.prepare(`SELECT * FROM ${table} ORDER BY id`).all().map((row: Row) => ({ ...row })) as Row[];
const state = (db: Fake) => JSON.stringify([rows(db, 'leads'), rows(db, 'lead_events'), db._db.prepare('SELECT * FROM sqlite_sequence ORDER BY name').all()]);
function enforceD1Limits(db: Fake): void {
  const prepare = db.prepare.bind(db); const batch = db.batch.bind(db);
  db.prepare = (sql: string) => {
    assert.ok(new TextEncoder().encode(sql).byteLength <= 100_000, 'D1 SQL statement <=100KB');
    // Count top-level arguments within each SQL function, respecting nested calls and quoted text.
    for (const match of sql.matchAll(/\b(?:json_array|json_object|json_group_array|substr|length|coalesce|sum|json)\s*\(/gi)) {
      let depth = 1; let commas = 0; let quote = ''; let end = Number(match.index) + match[0].length;
      for (; end < sql.length && depth; end++) {
        const character = sql[end];
        if (quote) {
          if (character === quote && sql[end + 1] === quote) { end++; continue; }
          if (character === quote) quote = '';
        } else if (character === "'" || character === '"') quote = character;
        else if (character === '(') depth++;
        else if (character === ')') depth--;
        else if (character === ',' && depth === 1) commas++;
      }
      assert.ok(commas + 1 <= 32, 'D1 function <=32 arguments');
    }
    const statement = prepare(sql); const bind = statement.bind.bind(statement);
    statement.bind = (...values: unknown[]) => { assert.ok(values.length <= 100, 'D1 statement <=100 bound parameters'); return bind(...values); };
    return statement;
  };
  db.batch = async (statements: Parameters<typeof db.batch>[0]) => {
    assert.ok(statements.length <= LEAD_ERASURE_LIMITS.batchStatements, 'single batch <=45 statements');
    assert.ok(statements.length + 2 <= 50, 'batch plus planning stays below Free query budget');
    return batch(statements);
  };
}
function seed(): Fake {
  const db = createFakeD1({ migrationsDir: fileURLToPath(new URL('../../worker/migrations/', import.meta.url)) });
  databases.push(db);
  const at = '2026-10-21T10:00:00.000Z';
  const insert = db._db.prepare(`INSERT INTO leads (id,created_at,updated_at,source,name,email,email_normalized,phone,phone_normalized,status_changed_at,returning_of_lead_id,notes,exclude)
    VALUES (?,?,?,'manual',?,?,?,?,?,?,?,?, 'test')`);
  for (const [id, name, email, phone, related] of [
    [A, 'Synthetic Alpha', 'alpha@example.invalid', '000999000001', null],
    [REPEAT, 'Synthetic Alpha', 'alpha@example.invalid', '000999000001', A],
    [B, 'Synthetic Beta', 'beta@example.invalid', '000999000002', A],
    [C, 'Synthetic Gamma', 'gamma@example.invalid', '000999000003', null],
  ]) insert.run(id, at, at, name, email, email, phone, phone, at, related, 'Synthetic fixture note');
  const event = db._db.prepare("INSERT INTO lead_events (lead_id,at,type,actor,note,meta) VALUES (?,?,'created','system',?,?)");
  event.run(A, at, 'Synthetic Alpha note', JSON.stringify({ email: 'alpha@example.invalid' }));
  event.run(REPEAT, at, null, JSON.stringify({ returning_of_lead_id: A }));
  event.run(B, at, 'Keep this event', JSON.stringify({ returning_of_lead_id: A, keep: 'retain', nested: [A, { id: REPEAT, keep: 7 }] }));
  event.run(C, at, null, JSON.stringify({ keep: 'unchanged' }));
  enforceD1Limits(db);
  return db;
}
async function apply(db: Parameters<typeof executeLeadErasure>[0], ids = TARGETS) {
  const plan = await planLeadErasure(db, ids);
  return executeLeadErasure(db, { leadIds: ids, apply: true, confirmation: plan.confirmation });
}

try {
  {
    const db = seed(); const before = state(db);
    const plan = await planLeadErasure(db, TARGETS);
    check(plan.mode === 'dry-run' && plan.leadsDeleted === 2 && plan.eventsDeleted === 2, 'matching real migration produces exact erasure counts');
    same(plan.relationshipsCleared, [B], 'plan identifies only inbound remaining lead link');
    same(plan.metadataEventsRedacted, [3], 'plan identifies only remaining event metadata cleanup');
    same(plan.blockers, [], 'complete exact target selection has no ambiguity blockers');
    check(!/Synthetic|alpha@|000999000001|"schema"/.test(JSON.stringify(plan)), 'public plan contains no contact payload or raw snapshot');
    const dry = await executeLeadErasure(db, { leadIds: TARGETS });
    check(dry.mode === 'dry-run', 'execute defaults to dry run');
    same(state(db), before, 'both planning and default execute leave every row unchanged');
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true }), 'stale-plan', 'apply requires exact confirmation');
    await fails(() => executeLeadErasure(db, { leadIds: [C], apply: true, confirmation: plan.confirmation }), 'stale-plan', 'confirmation binds selected UUIDs');
    const beforeLeads = rows(db, 'leads'); const beforeEvents = rows(db, 'lead_events');
    const result = await executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation });
    check(result.mode === 'applied' && result.leadsDeleted === 2 && result.eventsDeleted === 2 && !('confirmation' in result), 'successful guarded transaction returns exact summary without reusable confirmation');
    same(rows(db, 'leads'), beforeLeads.filter((row) => !TARGETS.includes(String(row.id))).map((row) => row.id === B ? { ...row, returning_of_lead_id: null } : row), 'no unrelated lead fields/rows are lost');
    same(rows(db, 'lead_events'), beforeEvents.filter((row) => !TARGETS.includes(String(row.lead_id))).map((row) => row.id === 3 ? { ...row, meta: JSON.stringify({ keep: 'retain', nested: [{ keep: 7 }] }) } : row), 'owned events erased and only targeted nested references removed');
    check(!state(db).includes('alpha@example.invalid') && !state(db).includes(A), 'selected personal data and copied ID relationships are absent from remaining logical rows');
    same(db._db.prepare('PRAGMA foreign_key_check').all(), [], 'no orphan event remains');
  }
  {
    const db = seed(); const before = state(db);
    const plan = await planLeadErasure(db, [A]);
    same(plan.sameContactCandidateIds, [REPEAT], 'same-contact enquiry is identified without automatic identity cascade');
    check(plan.blockers.some((item) => item.kind === 'same-contact-needs-review'), 'ambiguous contact requires manual review');
    await fails(() => executeLeadErasure(db, { leadIds: [A], apply: true, confirmation: plan.confirmation }), 'blocked', 'ambiguous identity');
    same(state(db), before, 'blocked operation preserves all data');
    await fails(() => planLeadErasure(db, []), 'invalid-selection', 'empty selection');
    await fails(() => planLeadErasure(db, ["' OR 1=1 --"]), 'invalid-selection', 'ID injection');
    await fails(() => planLeadErasure(db, Array(11).fill(A)), 'invalid-selection', 'selection above bound');
    await fails(() => planLeadErasure(db, [A, A]), 'invalid-selection', 'duplicate exact UUID selection');
    const upper = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa';
    await fails(() => planLeadErasure(db, [upper, upper.toUpperCase()]), 'invalid-selection', 'duplicate normalised UUID selection');
    await fails(() => planLeadErasure(db, ['00000000-0000-4000-8000-ffffffffffff']), 'missing-leads', 'missing exact ID');
  }
  {
    const db = seed();
    const insert = db._db.prepare("INSERT INTO lead_events(lead_id,at,type,actor,meta) VALUES (?,'x','created','system',?)");
    for (let index = 0; index < 25; index++) insert.run(B, JSON.stringify({ related: A, keep: index }));
    let maxParameters = 0; let batchStatements = 0;
    const prepared = db.prepare.bind(db); const batched = db.batch.bind(db);
    db.prepare = (sql: string) => { maxParameters = Math.max(maxParameters, (sql.match(/\?/g) ?? []).length); return prepared(sql); };
    db.batch = async (statements: Parameters<typeof db.batch>[0]) => { batchStatements = statements.length; return batched(statements); };
    const result = await apply(db);
    check(result.metadataEventsRedacted.length === 26 && rows(db, 'lead_events').length === 27, 'multiple metadata chunks clean every related event and preserve unrelated contents');
    check(maxParameters <= 60 && batchStatements === 9, 'chunked operation keeps statements and bound parameters within the documented ceiling');
  }
  for (const [label, meta] of [
    ['escaped email value', '{"copied":"\\u0061lpha@example.invalid"}'],
    ['escaped email key', '{"\\u0061lpha@example.invalid":"hidden"}'],
    ['escaped quoted name', '{"copied":"Synthetic \\u0041lpha"}'],
    ['embedded reference', JSON.stringify({ copied: `see ${A} in another event` })],
    ['malformed metadata', '{unreadable payload'],
  ]) {
    const db = seed(); db._db.prepare('UPDATE lead_events SET meta = ? WHERE id = 4').run(meta);
    const plan = await planLeadErasure(db, TARGETS); const before = state(db);
    check(plan.blockers.some((item) => item.table === 'lead_events' && item.rowId === 4 && item.columns.includes('meta')), `${label}: copied/unreadable metadata blocked after decoding`);
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'blocked', label);
    same(state(db), before, `${label}: zero partial deletion`);
  }
  {
    const db = seed();
    db._db.prepare('UPDATE leads SET notes = ? WHERE id = ?').run('Synthetic Alpha copied in a different enquiry', C);
    db._db.prepare('UPDATE lead_events SET note = ? WHERE id = 4').run('old contact alpha@example.invalid');
    const plan = await planLeadErasure(db, TARGETS);
    same(plan.blockers.map(({ table, rowId, columns }) => ({ table, rowId, columns })), [
      { table: 'leads', rowId: C, columns: ['notes'] }, { table: 'lead_events', rowId: 4, columns: ['note'] },
    ], 'free-text copy blockers expose only row IDs and column names');
    check(!JSON.stringify(plan).includes('alpha@example.invalid'), 'blocker summary never exposes copied personal text');
  }
  {
    const db = seed(); db._db.prepare('UPDATE leads SET returning_of_lead_id = ? WHERE id = ?').run(`unstructured ${A}`, C);
    const plan = await planLeadErasure(db, TARGETS);
    check(plan.blockers.some((item) => item.rowId === C && item.columns.includes('returning_of_lead_id')), 'malformed inbound relationship containing a selected ID blocks rather than surviving silently');
  }
  for (const ddl of [
    'CREATE TABLE copied_pii (lead_id TEXT,email TEXT)', 'CREATE TABLE sqlitex_private (email TEXT)', 'CREATE TABLE _cf_private (email TEXT)',
    'CREATE TABLE _cf_METADATA (key INTEGER PRIMARY KEY,value TEXT)',
    'ALTER TABLE leads ADD COLUMN copied_email TEXT', 'CREATE VIEW copied_pii AS SELECT email FROM leads',
    'CREATE TRIGGER side_effect AFTER DELETE ON leads BEGIN UPDATE leads SET notes = \'private\'; END',
    'CREATE INDEX copied_pii ON leads(email)',
  ]) {
    const db = seed(); db._db.exec(ddl);
    await fails(() => planLeadErasure(db, TARGETS), 'unsupported-schema', 'unknown schema object/column');
  }
  {
    const db = seed();
    db._db.exec(`CREATE TABLE IF NOT EXISTS "d1_migrations"(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);
      INSERT INTO d1_migrations(name) VALUES ('0001_leads.sql');
      CREATE TABLE _cf_KV(key TEXT PRIMARY KEY,value BLOB) WITHOUT ROWID;
      CREATE TABLE _cf_METADATA(key INTEGER PRIMARY KEY,value BLOB);`);
    const plan = await planLeadErasure(db, TARGETS);
    check(plan.blockers.length === 0, 'exact known Wrangler/D1 metadata schema is supported without a prefix exemption');
    await executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation });
    check(db._db.prepare('SELECT COUNT(*) AS n FROM d1_migrations').get()?.n === 1, 'erasure preserves migration metadata');
  }
  {
    const db = seed();
    db._db.exec("CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL); INSERT INTO d1_migrations(name) VALUES ('0001_leads.sql')");
    const plan = await planLeadErasure(db, TARGETS); const batch = db.batch.bind(db); let observed = '';
    db.batch = async (statements: Parameters<typeof db.batch>[0]) => {
      db._db.prepare("UPDATE d1_migrations SET applied_at = 'concurrent metadata edit' WHERE id = 1").run(); observed = state(db); return batch(statements);
    };
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'transaction-failed', 'migration history changes before batch');
    same(state(db), observed, 'migration history race leaves lead/event rows intact');
  }
  {
    const db = seed(); const plan = await planLeadErasure(db, TARGETS);
    db._db.prepare('UPDATE leads SET notes = ? WHERE id = ?').run('changed without updating updated_at', C);
    const before = state(db);
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'stale-plan', 'preflight detects full-row change without timestamp change');
    same(state(db), before, 'stale preflight does not lose the new data');
  }
  for (const [label, mutate] of [
    ['lead field', (db: Fake) => db._db.prepare("UPDATE leads SET message = 'concurrent edit' WHERE id = ?").run(C)],
    ['event payload', (db: Fake) => db._db.prepare("UPDATE lead_events SET meta = '{\"concurrent\":true}' WHERE id = 4").run()],
    ['new event', (db: Fake) => db._db.prepare("INSERT INTO lead_events(lead_id,at,type,actor) VALUES (?,'2026-10-21T11:00:00Z','note','system')").run(C)],
    ['sequence value', (db: Fake) => db._db.prepare("UPDATE sqlite_sequence SET seq = seq + 1 WHERE name = 'lead_events'").run()],
    ['schema', (db: Fake) => db._db.exec('CREATE TABLE concurrent_pii (email TEXT)')],
  ] as const) {
    const db = seed(); const plan = await planLeadErasure(db, TARGETS);
    const originalBatch = db.batch.bind(db); let observed = ''; let called = false;
    db.batch = async (statements: Parameters<typeof db.batch>[0]) => {
      called = true; mutate(db); observed = state(db); return originalBatch(statements);
    };
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'transaction-failed', `concurrent ${label} immediately before batch`);
    check(called, `concurrent ${label}: mutation occurred after all preflight reads`);
    same(state(db), observed, `concurrent ${label}: guard rolled back every erasure while preserving concurrent change`);
  }
  {
    const db = seed(); const plan = await planLeadErasure(db, TARGETS); const originalBatch = db.batch.bind(db);
    db.batch = async (statements: Parameters<typeof db.batch>[0]) => {
      await originalBatch(statements); throw new Error('private response lost after committed erasure');
    };
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'transaction-failed', 'response lost after successful commit');
    check(rows(db, 'leads').length === 2 && rows(db, 'lead_events').length === 2, 'ambiguous remote response does not incorrectly imply rollback or trigger automatic retry');
  }
  {
    const db = seed(); const plan = await planLeadErasure(db, TARGETS); const before = state(db);
    const schemaBefore = JSON.stringify(db._db.prepare('SELECT * FROM sqlite_schema ORDER BY name').all());
    let earlierWrites = 0;
    // Inject the fault INSIDE a faithful batch transaction after the snapshot guard and prior writes.
    // Existing triggers are rejected above; this injection proves a later SQLite failure rolls back.
    db.batch = async (statements: { execute(): { success: boolean; meta: { changes: number } } }[]) => {
      db._db.exec('BEGIN');
      try {
        const results = [];
        for (let index = 0; index < statements.length; index++) {
          if (index === statements.length - 3) db._db.exec("CREATE TRIGGER fail_erasure BEFORE DELETE ON leads BEGIN SELECT RAISE(ABORT,'private Synthetic Alpha alpha@example.invalid'); END");
          const result = statements[index].execute(); earlierWrites += result.meta.changes; results.push(result);
        }
        db._db.exec('COMMIT'); return results;
      } catch (error) { db._db.exec('ROLLBACK'); throw error; }
    };
    await fails(() => executeLeadErasure(db, { leadIds: TARGETS, apply: true, confirmation: plan.confirmation }), 'transaction-failed', 'trigger-induced late SQL failure');
    check(earlierWrites >= 4, 'trigger fault occurred after link, metadata and owned-event writes');
    same(state(db), before, 'late SQL error restores every lead/event/sequence value');
    same(JSON.stringify(db._db.prepare('SELECT * FROM sqlite_schema ORDER BY name').all()), schemaBefore, 'late SQL error rolls back injected schema fault too');
  }
  for (const limit of ['leads', 'events', 'bytes'] as const) {
    const db = seed();
    if (limit === 'leads') {
      const insert = db._db.prepare("INSERT INTO leads(id,created_at,updated_at,source,name,status_changed_at) VALUES (?,'x','x','manual','Synthetic extra','x')");
      for (let index = 5; index <= LEAD_ERASURE_LIMITS.leads + 1; index++) insert.run(`00000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`);
    } else if (limit === 'events') {
      const insert = db._db.prepare("INSERT INTO lead_events(lead_id,at,type,actor) VALUES (?,'x','created','system')");
      for (let index = 4; index <= LEAD_ERASURE_LIMITS.events; index++) insert.run(C);
    } else db._db.prepare('UPDATE leads SET message = ? WHERE id = ?').run('é'.repeat(LEAD_ERASURE_LIMITS.snapshotBytes / 2), C);
    const before = state(db);
    await fails(() => planLeadErasure(db, TARGETS), 'bounds-exceeded', `${limit} above bounded pilot limit`);
    same(state(db), before, `${limit} limit leaves database unchanged`);
  }
  same(network, [], 'all scenarios are network-free');
  same(logs, [], 'module logs neither driver errors nor customer payloads');
  console.log(`[ok] D1 erasure harness passed (${checks} checks)`);
} catch (error) {
  originalError(error); process.exitCode = 1;
} finally {
  console.error = originalError;
  for (const db of databases) db._db.close();
}
