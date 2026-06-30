# List dashboards

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/" | python3 -c "import json,sys; [print(f'{d[\"id\"]:>6}  {d[\"name\"]:<40}  tiles={len(d.get(\"tiles\",[]))}') for d in json.load(sys.stdin).get('results',[])]"
```
