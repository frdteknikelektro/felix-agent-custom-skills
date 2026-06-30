# List projects

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/" | python3 -c "import json,sys; [print(f'{p[\"id\"]:>6}  {p[\"name\"]:<30}  {p.get(\"organization_name\",\"\")}') for p in json.load(sys.stdin).get('results',[])]"
```
