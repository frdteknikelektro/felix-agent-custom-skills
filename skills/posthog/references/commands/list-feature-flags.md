# List feature flags

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/" | python3 -c "import json,sys; [print(f'{f[\"id\"]:>6}  {f[\"key\"]:<35}  active={f[\"active\"]}') for f in json.load(sys.stdin).get('results',[])]"
```
