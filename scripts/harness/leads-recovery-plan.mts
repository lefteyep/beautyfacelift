// Plan verification only: memory FakeD1 + real migration. No remote restore, account or mail.
// node --disable-warning=ExperimentalWarning --import tsx scripts/harness/leads-recovery-plan.mts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createFakeD1 } from './fake-d1.mjs';

type Fake = ReturnType<typeof createFakeD1>;
type Row = Record<string, unknown>;
type Verification = { check_name: string; passed: number; observed_count: number };
const A = 'b1f10000-2026-4000-8000-000000000001';
const B = 'b1f10000-2026-4000-8000-000000000002';
const FOREIGN = 'f0e10000-2026-4000-8000-000000000099';
const databases: Fake[] = [];
const network: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => { network.push(String(input)); throw new Error('External requests are blocked'); }) as typeof fetch;
let checks = 0;
function same(actual: unknown, expected: unknown, label: string): void { checks++; assert.deepEqual(actual, expected, label); console.log(`[ok] ${label}`); }
function check(value: unknown, label: string): void { checks++; assert.ok(value, label); console.log(`[ok] ${label}`); }

// Execute one statement at a time, intentionally WITHOUT a surrounding batch/transaction.
// SQL comments and quoted semicolons must not affect statement boundaries.
function splitSql(sql: string): string[] {
  const statements: string[] = []; let buffer = ''; let quote = '';
  for (let index = 0; index < sql.length; index++) {
    const character = sql[index];
    if (quote) {
      buffer += character;
      if (character === quote) {
        if (sql[index + 1] === quote) buffer += sql[++index]; else quote = '';
      }
    } else if (character === "'" || character === '"') { quote = character; buffer += character; }
    else if (sql.startsWith('--', index)) {
      const end = sql.indexOf('\n', index); index = end < 0 ? sql.length : end; buffer += ' ';
    } else if (sql.startsWith('/*', index)) {
      const end = sql.indexOf('*/', index + 2); assert.ok(end >= 0, 'closed SQL comment'); index = end + 1; buffer += ' ';
    } else if (character === ';') { if (buffer.trim()) statements.push(buffer.trim()); buffer = ''; }
    else buffer += character;
  }
  assert.equal(quote, '', 'closed SQL quote');
  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}
const fixture = (name: string) => splitSql(readFileSync(new URL(`../fixtures/d1-recovery/${name}`, import.meta.url), 'utf8'));
const seed = fixture('01-seed.sql');
const change = fixture('02-change.sql');
const baselineSql = fixture('03-verify-baseline.sql');
const changeSql = fixture('04-verify-change.sql');
function fresh(): Fake {
  const db = createFakeD1({ migrationsDir: fileURLToPath(new URL('../../worker/migrations/', import.meta.url)) });
  databases.push(db); return db;
}
const run = (db: Fake, statements: string[]) => statements.map((sql) => Number(db._db.prepare(sql).run().changes));
const rows = (db: Fake, table: string) => db._db.prepare(`SELECT * FROM ${table} ORDER BY id`).all().map((row: Row) => ({ ...row })) as Row[];
const snapshot = (db: Fake) => JSON.stringify({
  schema: db._db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name').all(),
  leads: rows(db, 'leads'), events: rows(db, 'lead_events'), sequence: db._db.prepare('SELECT * FROM sqlite_sequence ORDER BY name').all(),
});
function verify(db: Fake, which: 'baseline' | 'change'): Verification[] {
  const sql = which === 'baseline' ? baselineSql : changeSql;
  return db._db.prepare(sql[0]).all().map((row: Row) => ({ ...row })) as Verification[];
}
const accepted = (report: Verification[]) => report.length === 8 && report.every((row) => row.passed === 1);
const failedNames = (report: Verification[]) => report.filter((row) => row.passed !== 1).map((row) => row.check_name);
function addForeign(db: Fake): void {
  db._db.prepare(`INSERT INTO leads(id,created_at,updated_at,source,name,email,status_changed_at,notes)
    VALUES (?,'2000-01-01T00:00:00Z','2000-01-01T00:00:00Z','kontakt-page','SYNTHETIC UNRELATED FIXTURE','synthetic-unrelated@example.invalid','2000-01-01T00:00:00Z','Preserve unrelated data')`).run(FOREIGN);
  db._db.prepare("INSERT INTO lead_events(id,lead_id,at,type,actor,meta) VALUES (99,?,'2000-01-01T00:00:00Z','created','system','{\"fixture\":\"UNRELATED\"}')").run(FOREIGN);
}

try {
  same([seed.length, change.length, baselineSql.length, changeSql.length], [2, 2, 1, 1], 'fixture scripts contain two seed writes, two change writes and one read-only statement per verifier');
  for (const statements of [seed, change, baselineSql, changeSql]) {
    check(statements.every((sql) => new TextEncoder().encode(sql).byteLength < 100_000), 'every prepared statement fits the D1 statement-size ceiling');
    check(statements.every((sql) => !/\b(?:DELETE|DROP|ALTER|CREATE|BEGIN|COMMIT|ROLLBACK|REPLACE)\b/i.test(sql)), 'fixture SQL has no destructive/schema/transaction-control statements');
  }
  check([...baselineSql, ...changeSql].every((sql) => !/\b(?:INSERT|UPDATE|PRAGMA)\b/i.test(sql)), 'verification SQL contains no write statements or mutating pragma');
  {
    const db = fresh();
    check(db.migrations.includes('0001_leads.sql'), 'memory plan uses the real lead migration');
    check(!accepted(verify(db, 'baseline')) && !accepted(verify(db, 'change')), 'empty database is not misreported as either fixture state');
    same(run(db, seed), [2, 2], 'empty database seeds exactly two leads and two baseline events');
    const baseline = verify(db, 'baseline');
    check(accepted(baseline), 'all eight baseline checks accept the seeded state');
    check(rows(db, 'leads').find((row) => row.id === B)?.returning_of_lead_id === A
      && rows(db, 'leads').find((row) => row.id === A)?.returning_of_lead_id === null, 'fixture B points to A while A has no returning relationship');
    same(failedNames(verify(db, 'change')), ['change_events', 'fixture_a_changed', 'total_events'], 'changed-state verifier distinctly rejects baseline on its three delta checks');
    same(Object.keys(baseline[0]), ['check_name', 'passed', 'observed_count'], 'verification exposes only check names, passed flags and counts');
    check(baseline.every((row) => [0, 1].includes(row.passed) && Number.isSafeInteger(row.observed_count) && row.observed_count >= 0), 'all verification results are bounded flag/count evidence');
    check(!JSON.stringify(baseline).includes('@') && !JSON.stringify(baseline).includes(A), 'verification output contains no contact values or enquiry IDs');
    const before = snapshot(db);
    verify(db, 'baseline'); verify(db, 'change');
    same(snapshot(db), before, 'both verification statements are read-only including schema and sequence');
    same(run(db, seed), [0, 0], 'baseline seed replay inserts and overwrites nothing');
    same(snapshot(db), before, 'seed replay preserves the exact original state');
    const oldLeads = rows(db, 'leads'); const oldEvents = rows(db, 'lead_events');
    same(run(db, change), [1, 1], 'test change updates exactly one fixture and appends exactly one event');
    same([rows(db, 'leads').length, rows(db, 'lead_events').length], [2, 3], 'changed state is exactly two leads and three events');
    same(rows(db, 'leads'), oldLeads.map((row) => row.id === A ? { ...row, notes: 'BFL_D1_RECOVERY_CHANGE_A_V1', updated_at: '2026-10-21T12:00:00.000Z' } : row), 'only fixture A notes and updated_at change; fixture B and all other lead fields are preserved');
    same(rows(db, 'lead_events').filter((row) => row.id !== 3), oldEvents, 'both baseline events are preserved exactly');
    check(accepted(verify(db, 'change')), 'all eight change checks accept the changed state');
    same(failedNames(verify(db, 'baseline')), ['change_events', 'fixture_a_baseline', 'total_events'], 'baseline verifier distinctly rejects the changed state on three checks');
    const after = snapshot(db);
    same(run(db, change), [0, 0], 'change replay neither updates again nor duplicates its event');
    same(run(db, seed), [0, 0], 'seed cannot reset the changed fixture or delete its event');
    same(snapshot(db), after, 'all replays preserve the exact changed state');
    same(db._db.prepare('PRAGMA foreign_key_check').all(), [], 'baseline and delta events retain valid foreign keys');
  }
  {
    const db = fresh(); same(run(db, [seed[0]]), [2], 'interrupted seed model creates only the first-statement pair');
    check(!accepted(verify(db, 'baseline')), 'two fixture leads without their events are not a completed baseline');
    same(run(db, seed), [0, 2], 'exact interrupted seed can add its missing event pair without recreating leads');
    check(accepted(verify(db, 'baseline')), 'completed interrupted seed passes all baseline checks');
  }
  {
    const db = fresh(); run(db, seed); same(run(db, [change[0]]), [1], 'interrupted change model retains its lead update');
    check(!accepted(verify(db, 'baseline')) && !accepted(verify(db, 'change')), 'a changed lead without the delta event passes neither complete state');
    same(run(db, change), [0, 1], 'exact interrupted change can add its one missing event without rewriting the lead');
    check(accepted(verify(db, 'change')), 'completed interrupted change passes all delta checks');
  }
  for (const includeFixtures of [false, true]) {
    const db = fresh(); if (includeFixtures) run(db, seed); addForeign(db); const before = snapshot(db);
    same(run(db, seed), [0, 0], 'seed refuses any nonempty unrelated lead/event population');
    same(run(db, change), [0, 0], 'change refuses a population containing unrelated records');
    same(snapshot(db), before, 'unrelated records and all fixture fields/events remain byte-for-byte logically unchanged');
    check(!accepted(verify(db, 'baseline')) && !accepted(verify(db, 'change')), 'verification refuses a population outside the exact isolated fixture');
  }
  for (const [column, value] of [
    ['email', 'other-fixture@example.invalid'], ['email_normalized', 'other-fixture@example.invalid'], ['source', 'kontakt-page'], ['exclude', null],
    ['message', 'unrecognised fixture'], ['notes', 'unrecognised note'], ['name', 'UNRELATED SYNTHETIC NAME'], ['returning_of_lead_id', B],
  ] as const) {
    const db = fresh(); run(db, seed); db._db.prepare(`UPDATE leads SET ${column} = ? WHERE id = ?`).run(value, A); const before = snapshot(db);
    same(run(db, seed), [0, 0], `mismatched ${column}: seed does not replace a colliding fixture ID`);
    same(run(db, change), [0, 0], `mismatched ${column}: neither update nor event append is permitted`);
    same(snapshot(db), before, `mismatched ${column}: all existing records are preserved`);
  }
  {
    const db = fresh(); run(db, seed); db._db.prepare("UPDATE lead_events SET meta = '{\"fixture\":\"UNRELATED\"}' WHERE id = 2").run(); const before = snapshot(db);
    same(run(db, change), [0, 0], 'mismatched baseline event prevents the change and event append');
    same(snapshot(db), before, 'mismatched event data is never overwritten');
  }
  {
    const db = fresh();
    db._db.exec('PRAGMA foreign_keys = OFF');
    db._db.prepare("INSERT INTO lead_events(id,lead_id,at,type,actor) VALUES (99,?,'2000-01-01T00:00:00Z','created','system')").run(FOREIGN);
    db._db.exec('PRAGMA foreign_keys = ON'); const before = snapshot(db);
    same(run(db, seed), [0, 0], 'nonempty events alone prevent seed creation even with zero leads');
    same(snapshot(db), before, 'pre-existing orphan data is preserved for investigation');
    for (const mode of ['baseline', 'change'] as const) {
      const fk = verify(db, mode).find((row) => row.check_name === 'foreign_keys_valid');
      check(fk?.passed === 0 && fk?.observed_count === 1, `${mode} verifier detects one FK violation without exposing its row`);
    }
  }
  same(network, [], 'all plan checks made zero network calls');
  console.log(`[ok] recovery PLAN verification passed (${checks} checks; baseline 2 leads/2 events; change 2 leads/3 events). No remote restore was performed.`);
} catch (error) { console.error(error); process.exitCode = 1; }
finally { for (const db of databases) db._db.close(); }
