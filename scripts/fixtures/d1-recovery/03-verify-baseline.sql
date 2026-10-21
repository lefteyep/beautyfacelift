-- READ ONLY. Accept this baseline state only when ALL 8 passed values are 1.
-- Returns check labels, 0/1 and counts only; no contact details or event payloads.
WITH checks(check_name, expected_count, observed_count) AS (
  VALUES
    ('total_leads', 2, (SELECT COUNT(*) FROM leads)),
    ('total_events', 2, (SELECT COUNT(*) FROM lead_events)),
    ('fixture_identities', 2, (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')))),
    ('fixture_a_baseline', 1, (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_A_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z')),
    ('fixture_b_baseline', 1, (SELECT COUNT(*) FROM leads l WHERE l.source = 'manual' AND l.exclude = 'test'
    AND l.message = 'BFL_D1_RECOVERY_FIXTURE_V1' AND l.status = 'neu'
    AND l.created_at = '2026-10-21T11:00:00.000Z' AND l.status_changed_at = '2026-10-21T11:00:00.000Z'
    AND l.marketing_consent = 0 AND l.confirmation_sent_at IS NULL AND l.nudge_sent_at IS NULL
    AND ((l.id = 'b1f10000-2026-4000-8000-000000000001' AND l.returning_of_lead_id IS NULL AND l.name = 'SYNTHETIC D1 RECOVERY A' AND l.email = 'd1-recovery-a@example.invalid' AND l.email_normalized = 'd1-recovery-a@example.invalid')
      OR (l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.returning_of_lead_id = 'b1f10000-2026-4000-8000-000000000001' AND l.name = 'SYNTHETIC D1 RECOVERY B' AND l.email = 'd1-recovery-b@example.invalid' AND l.email_normalized = 'd1-recovery-b@example.invalid')) AND l.id = 'b1f10000-2026-4000-8000-000000000002' AND l.notes = 'BFL_D1_RECOVERY_BASELINE_B_V1' AND l.updated_at = '2026-10-21T11:00:00.000Z')),
    ('baseline_events', 2, (SELECT COUNT(*) FROM lead_events e WHERE e.at = '2026-10-21T11:00:00.000Z' AND e.type = 'created' AND e.actor = 'system'
    AND e.from_status IS NULL AND e.to_status = 'neu' AND e.note = 'BFL_D1_RECOVERY_BASELINE_EVENT_V1'
    AND ((e.id = 1 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000001' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"a","automation":"none"}')
      OR (e.id = 2 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000002' AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"baseline","slot":"b","automation":"none","returning_of_lead_id":"b1f10000-2026-4000-8000-000000000001"}')))),
    ('change_events', 0, (SELECT COUNT(*) FROM lead_events e WHERE e.id = 3 AND e.lead_id = 'b1f10000-2026-4000-8000-000000000001' AND e.at = '2026-10-21T12:00:00.000Z'
    AND e.type = 'notes' AND e.actor = 'system' AND e.from_status IS NULL AND e.to_status IS NULL AND e.note IS NULL
    AND e.meta = '{"fixture":"BFL_D1_RECOVERY_V1","stage":"change","slot":"a","automation":"none"}')),
    ('foreign_keys_valid', 0, (SELECT COUNT(*) FROM pragma_foreign_key_check))
)
SELECT check_name, CASE WHEN observed_count = expected_count THEN 1 ELSE 0 END AS passed, observed_count
FROM checks ORDER BY check_name;
