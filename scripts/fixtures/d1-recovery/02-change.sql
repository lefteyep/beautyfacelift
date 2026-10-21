-- PLAN FIXTURE CHANGE ONLY: one guarded lead UPDATE, then one guarded notes-event INSERT.
-- No DELETE/DROP, no messages or automation. Separate Console statements are not promised
-- atomic as a file. If interrupted, inspect both verifiers and rerun only after reviewing state.
-- Guard the ENTIRE expected fixture set; foreign/mismatched rows cause a no-op.
UPDATE leads
SET notes = 'BFL_D1_RECOVERY_CHANGE_A_V1', updated_at = '2026-10-21T12:00:00.000Z'
WHERE id = 'b1f10000-2026-4000-8000-000000000001' AND email = 'd1-recovery-a@example.invalid' AND email_normalized = 'd1-recovery-a@example.invalid'
  AND source = 'manual' AND exclude = 'test'
  AND notes = 'BFL_D1_RECOVERY_BASELINE_A_V1' AND updated_at = '2026-10-21T11:00:00.000Z'
  AND (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_A_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z') = 1 AND (SELECT COUNT(*) FROM leads) = 2 AND (SELECT COUNT(*) FROM lead_events) = 2
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
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_B_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z') = 1 AND (SELECT COUNT(*) FROM lead_events e WHERE e.at = '2026-10-21T11:00:00.000Z' AND e.type = 'created' AND e.actor = 'system'
    AND e.from_status IS NULL AND e.to_status = 'neu' AND e.note = 'BFL_D1_RECOVERY_BASELINE_EVENT_V1'
    AND ((e.id = 1 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000001' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"a","automation":"none"}')
      OR (e.id = 2 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000002' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"b","automation":"none","returning_of_lead_id":"b1f10000-2026-4000-8000-000000000001"}'))) = 2;

-- This can finish an interrupted update-without-event, but cannot duplicate an event or
-- append to a foreign/mismatched lead. Existing baseline events and fixture B stay unchanged.
INSERT INTO lead_events (id, lead_id, at, type, actor, from_status, to_status, note, meta)
SELECT 3, 'b1f10000-2026-4000-8000-000000000001', '2026-10-21T12:00:00.000Z', 'notes', 'system', NULL, NULL, NULL, '{"fixture":"BFL_D1_RECOVERY_V1","stage":"change","slot":"a","automation":"none"}'
WHERE (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.notes = 'BFL_D1_RECOVERY_CHANGE_A_V1' AND l.updated_at = '2026-10-21T12:00:00.000Z') = 1 AND (SELECT COUNT(*) FROM leads) = 2 AND (SELECT COUNT(*) FROM lead_events) = 2
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
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_B_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z') = 1 AND (SELECT COUNT(*) FROM lead_events e WHERE e.at = '2026-10-21T11:00:00.000Z' AND e.type = 'created' AND e.actor = 'system'
    AND e.from_status IS NULL AND e.to_status = 'neu' AND e.note = 'BFL_D1_RECOVERY_BASELINE_EVENT_V1'
    AND ((e.id = 1 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000001' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"a","automation":"none"}')
      OR (e.id = 2 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000002' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"b","automation":"none","returning_of_lead_id":"b1f10000-2026-4000-8000-000000000001"}'))) = 2;
