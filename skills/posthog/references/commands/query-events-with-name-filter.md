# Query events with name filter

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -G \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  --data-urlencode 'after=2024-06-01T00:00:00Z' \
  --data-urlencode 'before=2024-06-02T00:00:00Z' \
  --data-urlencode 'event=user_signed_up' \
  --data-urlencode 'limit=50' \
  "https://app.posthog.com/api/projects/{project_id}/events/"
```
