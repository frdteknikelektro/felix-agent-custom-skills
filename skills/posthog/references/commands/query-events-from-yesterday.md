# Query events from yesterday

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -G \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  --data-urlencode 'after=-1d' \
  --data-urlencode 'limit=10' \
  "https://app.posthog.com/api/projects/{project_id}/events/"
```
