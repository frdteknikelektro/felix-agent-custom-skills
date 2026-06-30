# Groups

PostHog supports group analytics (tracking behavior per organization/workspace rather than per user).

**List group types** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/groups/types/"
```

Returns available group types (e.g., `organization`, `company`, `project`).

**List groups of a type** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/groups/{group_type_index}/"
```

**Get group detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/groups/{group_type_index}/{group_key}/"
```

Returns group properties and associated events.
