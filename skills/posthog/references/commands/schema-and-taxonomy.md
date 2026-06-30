# Schema & Taxonomy

**List event definitions** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/event_definitions/"
```

Returns all known event names with volume, description, and tags. Useful for discovering what events exist before querying.

**Get event definition** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/event_definitions/{definition_id}/"
```

**List property definitions** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/property_definitions/"
```

Returns all known property names, types, and which events they're associated with.

**Get property definition** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/property_definitions/{definition_id}/"
```

**List custom actions** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/actions/"
```

**Create custom action** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Signed Up","steps":[{"event":"user_signed_up"}]}' \
  "https://app.posthog.com/api/projects/{project_id}/actions/"
```
