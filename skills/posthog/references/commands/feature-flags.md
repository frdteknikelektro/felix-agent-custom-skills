# Feature Flags

**List feature flags** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/"
```

**Get feature flag detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/{flag_id}/"
```

Returns key, name, active status, rollout percentage, filters, conditions.

**Create feature flag** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key":"new_checkout_flow","name":"New Checkout Flow","filters":{"groups":[{"properties":[],"rollout_percentage":0}]},"active":false}' \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/"
```

Flag key convention: lowercase, snake_case recommended. Keys are unique per project.

**Update feature flag** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active":true,"filters":{"groups":[{"properties":[],"rollout_percentage":50}]}}' \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/{flag_id}/"
```

Flag changes are instant — there is no draft mode and no deployment gate. The permission check must be strict.

**Delete feature flag** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/{flag_id}/"
```

This is destructive. Only run when the user explicitly asks to delete a specific flag.

**Get flag activity** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/feature_flags/{flag_id}/activity/"
```
