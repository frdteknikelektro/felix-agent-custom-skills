# Create feature flag

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key":"new_onboarding","name":"New Onboarding Flow","active":false,"filters":{"groups":[{"properties":[],"rollout_percentage":0}]}}' \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/"
```
