# Bounded D1-binding erasure

Prepared 21 October 2026. Implementation and synthetic checks are complete; no live database, migration, email or remote operation was used. This supplements [lead data operations](LEAD-DATA-OPERATIONS.md). It does not approve a retention period or production deletion.

## Integration contract

[worker/leads/erasure.ts](../../worker/leads/erasure.ts) exports:

```ts
planLeadErasure(db: D1Database, leadIds: readonly string[]): Promise<LeadErasurePlan>
executeLeadErasure(db: D1Database, {
  leadIds: readonly string[], apply?: boolean, confirmation?: string
}): Promise<LeadErasurePlan | LeadErasureApplied>
```

Execution defaults to a read-only preview. `apply: true` also requires the exact confirmation digest from a current preview. The caller must enforce staff authentication/authorization, CSRF/same-origin protection, independent `LEADS_DATA_OPERATIONS=on` and operator allow-list gates, typed action confirmation, and a private authorised case reference. The module has no authority of its own. Its protected route is integrated at `/admin/leads/data/erase/`: normal Access guard first, agency-only identity plus separate operator list, operations gate, same-origin CSRF, exact UUIDs, case code, preview digest and typed LOESCHEN. It has no normal staff-navigation link. Completion logs contain only a case-code hash and counts; an ambiguous response has no fabricated success log. Do not expose or log internal database values. Returned plans contain exact enquiry/event IDs, affected counts, blocker column names and digests; they contain no names, contact/message/notes data or raw snapshot. Duplicate UUID selections, including different case spellings of one UUID, fail closed.

The operator reviews all relevant enquiry IDs and identity evidence, resolves blockers, checks the private case and approved scope, then confirms the reviewed digest. The operation deletes only selected enquiries and their owned events, clears inbound repeat-enquiry IDs and removes exact selected IDs from remaining events' nested JSON keys/values. Other fields remain intact. Same-contact ambiguity, copied personal details, embedded non-exact IDs and unreadable metadata block the operation; no other enquiry is automatically deleted. JSON values and keys are decoded before scanning. Variations, misspellings and transformed copies still require human review. This is a logical database erasure, not a forensic wipe or provider-history/mailbox/backup deletion.

## Atomicity and limits

The confirmation covers the exact SQL-generated JSON snapshot of every reviewed lead/event column, schema object, sequence record and optional Wrangler migration record, in stable order. Harmless schema whitespace/comments/identifier quoting are normalised for review against fixed definitions. Extra tables, indexes, views, triggers or columns are rejected. Known `_cf_KV`, `_cf_METADATA`, `sqlite_sequence`, autoindexes and default `d1_migrations` are individually allow-listed; there is no general reserved-prefix exemption. Contents of the two exactly reviewed provider metadata tables are not queried or changed; no general `_cf_` exemption is permitted. The `_cf_METADATA` definition was observed in the actual local Miniflare/workerd binding.

The first statement of the **same D1 batch** compares the current full snapshot with the planned snapshot. A mismatch attempts an insert that violates a required column's NOT NULL constraint, aborting the batch before erasure. A match inserts nothing. Cleanup, deletion and final count/reference assertions all run inside that batch. No independent preflight check substitutes for this guard. Cloudflare documents [batch rollback semantics](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) and the [SQLite/JSON SQL support](https://developers.cloudflare.com/d1/sql-api/sql-statements/) used here.

The fixed pilot bounds are:

- 1–10 distinct, exact UUIDs selected; at most 100 stored leads and 400 events in the whole database.
- At most 65,536 UTF-8 bytes in the complete canonical snapshot, 20 schema objects, 100 optional migration records and 2 sequence records.
- Metadata changes are chunked in groups of 20 inside the single transaction. The complete operation fails closed above 45 batch statements; two planning reads leave room within the Free per-invocation query budget. Each update/check uses at most 60 bound values. Wide row snapshots join JSON arrays of at most 20 columns, respecting D1's function-argument ceiling.

These are technical operation limits, not retention rules. Counts and raw text size are checked before assembling the full JSON; the final UTF-8 snapshot size is checked too. An exceeded bound or unsupported schema requires a reviewed extension before retrying. Do not bypass the guard or truncate the snapshot.

`LeadErasureError.code` is one of `invalid-selection`, `missing-leads`, `unsupported-schema`, `bounds-exceeded`, `blocked`, `stale-plan`, `transaction-failed`, `storage-unavailable`. Messages are fixed and never include driver text. `stale-plan` is reported only for a pre-batch confirmation mismatch. **Any batch exception returns `transaction-failed` with an unconfirmed outcome**, because a response can be lost after a successful commit. The operator must inspect the affected IDs and private case before generating another preview or retrying. Never claim that an ambiguous remote failure proves nothing was deleted. The module performs no automatic retry.

## Verification and remaining environmental work

[scripts/harness/leads-erasure.mts](../../scripts/harness/leads-erasure.mts) uses the real repository migration with SQLite-backed D1 and blocked network. Run `node --disable-warning=ExperimentalWarning --import tsx scripts/harness/leads-erasure.mts`. Its adapter enforces D1's 32 function arguments, 100 bound parameters, 100KB statement and query budget limits; see [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/). Checks cover exact/no-unrelated loss, multiple metadata chunks, decoded/ambiguous copies, missing/duplicate IDs, unsupported schema, lead/event/snapshot bounds, changed full rows without timestamp changes, and races inserted immediately before the atomic batch (lead/event/schema/sequence/migration changes). A trigger fault injected after preceding writes proves full rollback. A successful commit followed by a lost response separately proves the safe unconfirmed-outcome error.

The finite harnesses are automatically included by `validate:harnesses`; package commands also expose core, route and runtime checks individually. The route harness covers ordinary/studio denial, disabled gates, CSRF, read-only preview, typed confirmation, stale selection, exact cleanup and a lost response after commit. A separate [local workerd/D1 runtime harness](../../scripts/harness/leads-erasure-runtime.mts) uses an isolated synthetic local binding with remote access and telemetry disabled. It reproduced the real provider metadata schema and expression-depth ceiling, then verified the balanced SQL arithmetic, exact erasure and atomic race rollback. This checks the actual local runtime rather than relying only on Node SQLite. No remote account state is proved. Actual account/schema/permission compatibility, an approved synthetic D1 recovery/erasure drill, independently monitored storage failure handling, assigned operators, approved disclosure/retention and deployment authority remain environmental/policy gates. Do not run a production erasure to establish those prerequisites.
