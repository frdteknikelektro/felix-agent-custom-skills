# Persons

**List persons** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/persons/"
```

Supports property filters: `?properties=[{"key":"email","operator":"exact","value":"user@example.com"}]` and search: `?search=query`.

**Get person profile** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/persons/{person_id}/"
```

Returns person properties, distinct IDs, and creation date.

**Get person events** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/persons/{person_id}/events/"
```

Returns all events for a specific person. Use for debugging user journeys.

**Update person properties** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"properties":{"plan":"enterprise"}}' \
  "https://app.posthog.com/api/projects/{project_id}/persons/{person_id}/"
```

**Delete person** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/persons/{person_id}/"
```

This deletes the person and all their events. Requires explicit user intent.
