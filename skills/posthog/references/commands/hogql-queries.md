# HogQL Queries

**Execute HogQL query** (`posthog.read`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT event, count() as total FROM events WHERE timestamp > now() - INTERVAL 7 DAY GROUP BY event ORDER BY total DESC LIMIT 20"}' \
  "https://app.posthog.com/api/projects/{project_id}/query/"
```

HogQL is a ClickHouse-compatible SQL dialect. Available tables:
- `events` — event data (most commonly queried)
- `persons` — person profiles (may contain PII — warn the user)
- `session_recording_events` — session recording metadata
- `raw_session_replay_events` — raw replay snapshots
- `cohort_people` — cohort membership
- `insights_query` — cached insight results

Rate limit: 2400 queries/hour. Response is raw JSON rows.

**Warn about PII**: If the query targets `persons` table properties or selects email/name/distinct_id fields, warn the user that the result may contain personally identifiable information.
