# Annotations

**List annotations** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/annotations/?after=2024-01-01T00:00:00Z&before=2024-01-31T23:59:59Z"
```

**Get annotation detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/annotations/{annotation_id}/"
```

**Create annotation** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Deployed v2.3.0","date_marker":"2024-06-15T10:00:00Z","scope":"organization"}' \
  "https://app.posthog.com/api/projects/{project_id}/annotations/"
```

Scope can be `organization` (visible across all org projects, useful for deployments) or `project` (single project only).

**Update annotation** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated content"}' \
  "https://app.posthog.com/api/projects/{project_id}/annotations/{annotation_id}/"
```

**Delete annotation** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/annotations/{annotation_id}/"
```
