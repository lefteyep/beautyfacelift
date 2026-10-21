-- PLAN FIXTURE ONLY: separately approved disposable D1 database with reviewed 0001_leads.sql.
-- No remote execution or migration is implied by this file. Two separate statements: no
-- all-file Console transaction/rollback guarantee. Run the read-only verifier after every step.
-- First statement inserts BOTH leads only when leads AND lead_events are completely empty.
WITH fixtures(id, name, email, notes) AS (
  VALUES
    ('b1f10000-2026-4000-8000-000000000001', 'SYNTHETIC D1 RECOVERY A', 'd1-recovery-a@example.invalid', 'BFL_D1_RECOVERY_BASELINE_A_V1'),
    ('b1f10000-2026-4000-8000-000000000002', 'SYNTHETIC D1 RECOVERY B', 'd1-recovery-b@example.invalid', 'BFL_D1_RECOVERY_BASELINE_B_V1')
)
INSERT INTO leads (id, created_at, updated_at, source, name, email, email_normalized, status,
  status_changed_at, notes, message, exclude, marketing_consent, returning_of_lead_id)
SELECT id, '2026-10-21T11:00:00.000Z', '2026-10-21T11:00:00.000Z', 'manual', name, email, email, 'neu',
  '2026-10-21T11:00:00.000Z', notes, 'BFL_D1_RECOVERY_FIXTURE_V1', 'test', 0,
  CASE WHEN id = 'b1f10000-2026-4000-8000-000000000002' THEN 'b1f10000-2026-4000-8000-000000000001' ELSE NULL END
FROM fixtures
WHERE NOT EXISTS (SELECT 1 FROM leads) AND NOT EXISTS (SELECT 1 FROM lead_events);

-- A replay does not overwrite anything. It may finish an exact two-lead / zero-event
-- interrupted seed only; unrelated or mismatched records make this statement a no-op.
WITH fixtures(id, lead_id, meta) AS (
  VALUES (1, 'b1f10000-2026-4000-8000-000000000001', '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"a","automation":"none"}'),
         (2, 'b1f10000-2026-4000-8000-000000000002', '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"b","automation":"none","returning_of_lead_id":"b1f10000-2026-4000-8000-000000000001"}')
)
INSERT INTO lead_events (id, lead_id, at, type, actor, from_status, to_status, note, meta)
SELECT id, lead_id, '2026-10-21T11:00:00.000Z', 'created', 'system', NULL, 'neu', 'BFL_D1_RECOVERY_BASELINE_EVENT_V1', meta
FROM fixtures
WHERE (SELECT COUNT(*) FROM leads) = 2 AND NOT EXISTS (SELECT 1 FROM lead_events)
  AND (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid'))) = 2 AND (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_A_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z') = 1 AND (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_B_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z') = 1;
