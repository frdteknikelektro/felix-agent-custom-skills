# Property Filters

JSON filter arrays must be URL-encoded when used as GET query parameters. Use `--data-urlencode`:

```bash
curl -s -G \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  --data-urlencode 'properties=[{"key":"plan","operator":"exact","value":"pro","type":"event"}]' \
  "https://app.posthog.com/api/projects/{project_id}/events/"
```
