SELECT count() AS "value"
FROM "logs"."workersLogs"
WHERE "accountTag" = 'ee2019b3b7bc0527ffa154de4d2349ca'
  AND "scriptName" = 'beautyfacelift'
  AND "message" LIKE '%lead_storage_failed%'
