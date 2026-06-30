# Run HogQL query

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT event, count() as total FROM events WHERE timestamp > now() - INTERVAL 7 DAY GROUP BY event ORDER BY total DESC LIMIT 10"}' \
  "https://app.posthog.com/api/projects/{project_id}/query/"
```
