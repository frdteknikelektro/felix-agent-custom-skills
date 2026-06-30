# List event definitions

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/event_definitions/" | python3 -c "import json,sys; [print(f'{e[\"name\"]:<45}  vol={e.get(\"volume_30_day\",0)}') for e in json.load(sys.stdin).get('results',[])]"
```
