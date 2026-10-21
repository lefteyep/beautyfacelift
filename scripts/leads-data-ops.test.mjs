import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { copyFixture, createFixture, eraseFixture, inspectFixture } from './leads-data-ops.mjs';

const CLI = fileURLToPath(new URL('./leads-data-ops.mjs', import.meta.url));
const TARGETS = ['fixture-a', 'fixture-a-repeat'];

function fixture(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'bfl-lead-data-ops-'));
  t.after(() => {
    // Only a newly created, checked test directory under the OS temp root is removed.
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('bfl-lead-data-ops-'));
    rmSync(dir, { recursive: true, force: true });
  });
  const file = path.join(dir, 'fixture.sqlite');
  createFixture(file, { apply: true, confirmation: 'CREATE-SYNTHETIC-FIXTURE' });
  return { dir, file };
}

function withDb(file, action) {
  const db = new DatabaseSync(file);
  try { db.exec('PRAGMA foreign_keys = ON'); return action(db); } finally { db.close(); }
}

const rows = (file, table) => withDb(file, (db) => db.prepare(`SELECT * FROM ${table} ORDER BY id`).all().map((row) => ({ ...row })));
const erasePlan = (file) => eraseFixture(file, { leadIds: TARGETS });
const applyPlan = (file, plan) => eraseFixture(file, { leadIds: plan.leadIds, apply: true, confirmation: plan.confirmation });

test('fixture creation is dry-run by default and never overwrites an existing file', (t) => {
  const { dir, file } = fixture(t);
  const newFile = path.join(dir, 'new.sqlite');
  assert.equal(createFixture(newFile).mode, 'dry-run');
  assert.equal(existsSync(newFile), false);
  assert.throws(() => createFixture(newFile, { apply: true }), /Confirmation/);
  const before = readFileSync(file);
  assert.throws(() => createFixture(file, { apply: true, confirmation: 'CREATE-SYNTHETIC-FIXTURE' }), /overwrite/);
  assert.deepEqual(readFileSync(file), before);
});

test('inspection and erase dry run leave file bytes unchanged and expose no payload', (t) => {
  const { file } = fixture(t);
  const before = readFileSync(file);
  const summary = inspectFixture(file);
  assert.equal(summary.leads, 4);
  assert.equal(summary.events, 4);
  const plan = erasePlan(file);
  assert.equal(plan.mode, 'dry-run');
  assert.equal(plan.leadsDeleted, 2);
  assert.equal(plan.eventsDeleted, 2);
  assert.deepEqual(plan.relationshipsCleared, ['fixture-b']);
  assert.deepEqual(plan.metadataEventsRedacted, [3]);
  assert.deepEqual(plan.blockers, []);
  assert.doesNotMatch(JSON.stringify({ summary, plan }), /Alpha|alpha@|00000000001|Synthetic target/);
  assert.deepEqual(readFileSync(file), before);
});

test('targeted erasure deletes owned PII/events, clears references and preserves unrelated data', (t) => {
  const { file } = fixture(t);
  const beforeLeads = rows(file, 'leads');
  const beforeEvents = rows(file, 'lead_events');
  assert.equal(applyPlan(file, erasePlan(file)).mode, 'applied');
  const afterLeads = rows(file, 'leads');
  const afterEvents = rows(file, 'lead_events');
  assert.deepEqual(afterLeads, beforeLeads.filter((row) => !TARGETS.includes(row.id)).map((row) => (
    row.id === 'fixture-b' ? { ...row, returning_of_lead_id: null } : row
  )));
  assert.deepEqual(afterEvents, beforeEvents.filter((row) => !TARGETS.includes(row.lead_id)).map((row) => (
    row.id === 3 ? { ...row, meta: JSON.stringify({ keep: 'unrelated', nested: ['retain'] }) } : row
  )));
  assert.doesNotMatch(JSON.stringify({ afterLeads, afterEvents }), /fixture-a|alpha@|Synthetic Alpha|00000000001/);
  withDb(file, (db) => assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []));
});

test('single-enquiry selection flags contact duplicates without erasing other enquiries automatically', (t) => {
  const { file } = fixture(t);
  const plan = eraseFixture(file, { leadIds: ['fixture-a'] });
  assert.deepEqual(plan.sameContactCandidateIds, ['fixture-a-repeat']);
  assert.ok(plan.blockers.some((blocker) => blocker.kind === 'same-contact-needs-review'));
  assert.throws(() => applyPlan(file, plan), /blocked/);
  assert.equal(inspectFixture(file).leads, 4);
});

test('confirmation binds the file, lead set and data revision; every mutation requires apply', (t) => {
  const { dir, file } = fixture(t);
  const plan = erasePlan(file);
  assert.throws(() => eraseFixture(file, { leadIds: TARGETS, apply: true }), /Confirmation/);
  assert.throws(() => eraseFixture(file, { leadIds: TARGETS, confirmation: plan.confirmation }), /requires --apply/);
  assert.throws(() => eraseFixture(file, { leadIds: ['fixture-c'], apply: true, confirmation: plan.confirmation }), /Confirmation/);
  const another = path.join(dir, 'another.sqlite');
  createFixture(another, { apply: true, confirmation: 'CREATE-SYNTHETIC-FIXTURE' });
  assert.throws(() => applyPlan(another, plan), /Confirmation/);
  withDb(file, (db) => db.prepare("UPDATE leads SET notes = 'changed since review' WHERE id = 'fixture-c'").run());
  const changedHash = inspectFixture(file).snapshotHash;
  assert.throws(() => applyPlan(file, plan), /Confirmation/);
  assert.equal(inspectFixture(file).snapshotHash, changedHash);
});

test('unstructured PII, embedded IDs and malformed JSON references block instead of silently dropping data', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => {
    db.prepare("UPDATE leads SET notes = 'contact alpha@example.invalid in an old message' WHERE id = 'fixture-c'").run();
    db.prepare("UPDATE lead_events SET note = 'Related enquiry fixture-a in free text', meta = '{broken: alpha@example.invalid' WHERE id = 4").run();
  });
  const plan = erasePlan(file);
  const before = inspectFixture(file).snapshotHash;
  assert.deepEqual(plan.blockers.map(({ table, columns }) => ({ table, columns })), [
    { table: 'leads', columns: ['notes'] }, { table: 'lead_events', columns: ['note', 'meta'] },
  ]);
  assert.doesNotMatch(JSON.stringify(plan), /alpha@example.invalid|Related enquiry|broken/);
  assert.throws(() => applyPlan(file, plan), /blocked/);
  assert.equal(inspectFixture(file).snapshotHash, before);
});

test('escaped JSON personal data and embedded IDs block erasure in decoded keys and values', (t) => {
  for (const meta of [
    '{"email":"\\u0061lpha@example.invalid"}',
    '{"\\u0061lpha@example.invalid":"copied keyed contact"}',
    '{"nested":[{"name":"Synthetic \\u0041lpha"}]}',
    '{"message":"Related \\u0066ixture-a received"}',
  ]) {
    const { file } = fixture(t);
    withDb(file, (db) => db.prepare('UPDATE lead_events SET meta = ? WHERE id = 4').run(meta));
    const plan = erasePlan(file);
    const before = inspectFixture(file).snapshotHash;
    assert.ok(plan.blockers.some((blocker) => blocker.table === 'lead_events' && blocker.rowId === 4 && blocker.columns.includes('meta')));
    assert.throws(() => applyPlan(file, plan), /blocked/);
    assert.equal(inspectFixture(file).snapshotHash, before);
    assert.equal(rows(file, 'lead_events').find((row) => row.id === 4).meta, meta);
  }
});

test('nested exact ID references are removed while unrelated metadata survives', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => db.prepare('UPDATE lead_events SET meta = ? WHERE id = 4').run(JSON.stringify({
    nested: { link: 'fixture-a-repeat', keep: 7 }, list: ['fixture-a', { id: 'fixture-a-repeat', keep: true }],
    'fixture-a': 'must remove keyed relationship', keep: 'retain',
  })));
  applyPlan(file, erasePlan(file));
  assert.deepEqual(JSON.parse(rows(file, 'lead_events').find((row) => row.id === 4).meta), {
    nested: { keep: 7 }, list: [{ keep: true }], keep: 'retain',
  });
});

test('a SQL failure after relationship/event changes rolls back the entire transaction', (t) => {
  const { file } = fixture(t);
  const plan = erasePlan(file);
  const beforeLeads = rows(file, 'leads');
  const beforeEvents = rows(file, 'lead_events');
  const beforeHash = inspectFixture(file).snapshotHash;
  const original = DatabaseSync.prototype.prepare;
  let reachedDelete = false;
  t.mock.method(DatabaseSync.prototype, 'prepare', function (sql, ...args) {
    if (sql === 'DELETE FROM leads WHERE id = ?') {
      reachedDelete = true;
      // Execute a genuinely invalid SQLite statement only after preceding writes have run.
      return original.call(this, 'DELETE FROM deliberately_missing_table');
    }
    return original.call(this, sql, ...args);
  });
  assert.throws(() => applyPlan(file, plan), /no such table/);
  t.mock.restoreAll();
  assert.equal(reachedDelete, true);
  assert.deepEqual(rows(file, 'leads'), beforeLeads);
  assert.deepEqual(rows(file, 'lead_events'), beforeEvents);
  assert.equal(inspectFixture(file).snapshotHash, beforeHash);
  // The closed failed connection leaves no lock: the same reviewed plan can now complete.
  assert.equal(applyPlan(file, plan).mode, 'applied');
});

test('backup, erase, restore-to-new-file drill verifies full synthetic content and keeps active data intact', (t) => {
  const { dir, file } = fixture(t);
  const backup = path.join(dir, 'backup.sqlite');
  const restored = path.join(dir, 'restored.sqlite');
  const before = inspectFixture(file).snapshotHash;
  const backupPlan = copyFixture(file, backup);
  assert.equal(existsSync(backup), false);
  assert.throws(() => copyFixture(file, backup, { apply: true }), /Confirmation/);
  assert.equal(copyFixture(file, backup, { apply: true, confirmation: backupPlan.confirmation }).verified, true);
  assert.equal(inspectFixture(backup).snapshotHash, before);
  applyPlan(file, erasePlan(file));
  const erasedHash = inspectFixture(file).snapshotHash;
  const restorePlan = copyFixture(backup, restored, { operation: 'restore' });
  assert.equal(existsSync(restored), false);
  assert.equal(copyFixture(backup, restored, { operation: 'restore', apply: true, confirmation: restorePlan.confirmation }).verified, true);
  assert.equal(inspectFixture(restored).snapshotHash, before);
  assert.equal(inspectFixture(file).snapshotHash, erasedHash);
  assert.equal(inspectFixture(backup).snapshotHash, before);
  assert.deepEqual(rows(restored, 'leads'), rows(backup, 'leads'));
  assert.deepEqual(rows(restored, 'lead_events'), rows(backup, 'lead_events'));
  assert.throws(() => copyFixture(backup, file, { operation: 'restore', apply: true, confirmation: restorePlan.confirmation }), /overwrite/);
  assert.throws(() => copyFixture(file, backup), /overwrite/);
});

test('unmarked data, missing files, unknown schemas, remote paths and ID injection fail closed', (t) => {
  const { dir, file } = fixture(t);
  const missing = path.join(dir, 'missing.sqlite');
  assert.throws(() => inspectFixture(missing), /must already exist/);
  assert.equal(existsSync(missing), false);
  for (const remote of ['https://example.invalid/db.sqlite', 'file:///tmp/db.sqlite', '\\\\server\\share\\db.sqlite', '//server/share/db.sqlite']) {
    assert.throws(() => inspectFixture(remote), /network paths/);
  }
  assert.throws(() => inspectFixture(path.join(dir, '.wrangler', 'db.sqlite')), /Wrangler/);
  assert.throws(() => eraseFixture(file, { leadIds: ["fixture-a' OR 1=1 --"] }), /exact lead ID/);
  assert.throws(() => eraseFixture(file, { leadIds: ['unknown-id'] }), /must exist/);
  const unmarked = path.join(dir, 'unmarked.sqlite');
  withDb(unmarked, (db) => db.exec('CREATE TABLE leads (id TEXT)'));
  assert.throws(() => inspectFixture(unmarked), /Unsupported schema/);
  withDb(file, (db) => db.exec('CREATE TABLE future_pii (lead_id TEXT, email TEXT)'));
  assert.throws(() => erasePlan(file), /Unsupported schema/);
});

test('unknown columns require a schema/erasure review', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => db.exec('ALTER TABLE leads ADD COLUMN future_pii TEXT'));
  assert.throws(() => inspectFixture(file), /Unsupported schema/);
});

test('SQLite-looking user table names are not mistaken for reserved internal tables', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => {
    // Only sqlite_ is reserved. The underscore in an unescaped LIKE pattern matches any character.
    db.exec('CREATE TABLE sqliteCopy (lead_id TEXT, email TEXT)');
    db.prepare('INSERT INTO sqliteCopy VALUES (?, ?)').run('fixture-a', 'alpha@example.invalid');
  });
  assert.throws(() => inspectFixture(file), /Unsupported schema/);
  assert.throws(() => erasePlan(file), /Unsupported schema/);
});

test('unknown triggers require a schema/erasure review', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => db.exec("CREATE TRIGGER future_side_effect AFTER DELETE ON leads BEGIN UPDATE leads SET notes = 'unreviewed side effect'; END"));
  assert.throws(() => erasePlan(file), /Unsupported schema/);
});

test('changed or additional migrations cannot silently expand the supported erasure schema', (t) => {
  const { dir } = fixture(t);
  const isolated = path.join(dir, 'isolated');
  mkdirSync(path.join(isolated, 'scripts'), { recursive: true });
  mkdirSync(path.join(isolated, 'worker/migrations'), { recursive: true });
  const isolatedCli = path.join(isolated, 'scripts/leads-data-ops.mjs');
  writeFileSync(isolatedCli, readFileSync(CLI));
  const migration = readFileSync(new URL('../worker/migrations/0001_leads.sql', import.meta.url), 'utf8');
  const isolatedMigration = path.join(isolated, 'worker/migrations/0001_leads.sql');
  writeFileSync(isolatedMigration, `${migration}\n-- unreviewed change\n`);
  const run = () => spawnSync(process.execPath, [isolatedCli, 'fixture', '--db', path.join(dir, 'must-not-create.sqlite')], { encoding: 'utf8' });
  const changed = run();
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /reviewed migration changed/i);
  writeFileSync(isolatedMigration, migration);
  writeFileSync(path.join(isolated, 'worker/migrations/0002_unreviewed.sql'), 'CREATE TABLE copied_pii (email TEXT);');
  const added = run();
  assert.notEqual(added.status, 0);
  assert.match(added.stderr, /Migrations changed/);
  assert.equal(existsSync(path.join(dir, 'must-not-create.sqlite')), false);
});

test('invalid fixture marker is rejected', (t) => {
  const { file } = fixture(t);
  withDb(file, (db) => db.prepare("UPDATE lead_ops_fixture SET instance = 'not-a-real-instance'").run());
  assert.throws(() => inspectFixture(file), /Not a tool-created synthetic fixture/);
});

test('backup captures committed WAL data while a writer connection remains open', (t) => {
  const { dir, file } = fixture(t);
  withDb(file, (db) => {
    db.exec('PRAGMA journal_mode = WAL; PRAGMA wal_autocheckpoint = 0');
    db.prepare("UPDATE leads SET notes = 'committed WAL change' WHERE id = 'fixture-c'").run();
    const expected = inspectFixture(file).snapshotHash;
    const output = path.join(dir, 'wal-backup.sqlite');
    const plan = copyFixture(file, output);
    assert.equal(copyFixture(file, output, { apply: true, confirmation: plan.confirmation }).verified, true);
    assert.equal(inspectFixture(output).snapshotHash, expected);
    assert.equal(rows(output, 'leads').find((row) => row.id === 'fixture-c').notes, 'committed WAL change');
  });
});

test('CLI rejects remote/retention modes, returns nonzero failures and prints no sensitive payload', (t) => {
  const { file } = fixture(t);
  const cli = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  for (const args of [['erase', '--db', file, '--remote'], ['retention', '--db', file], ['inspect', '--db', file, '--apply']]) {
    assert.notEqual(cli(...args).status, 0);
  }
  const plan = cli('erase', '--db', file, '--lead', 'fixture-a', '--lead', 'fixture-a-repeat');
  assert.equal(plan.status, 0, plan.stderr);
  assert.equal(JSON.parse(plan.stdout).mode, 'dry-run');
  assert.doesNotMatch(plan.stdout + plan.stderr, /alpha@example.invalid|Synthetic Alpha|00000000001/);
  const failed = cli('erase', '--db', file, '--lead', 'fixture-a', '--apply', '--confirm', 'wrong');
  assert.equal(failed.status, 1);
  assert.equal(inspectFixture(file).leads, 4);
  const invalidFile = path.join(path.dirname(file), 'invalid.sqlite');
  writeFileSync(invalidFile, 'not a database');
  const invalid = cli('inspect', '--db', invalidFile);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /no successful completion/);
});
