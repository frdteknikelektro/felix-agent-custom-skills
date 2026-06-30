# Dashboards

**List dashboards** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/"
```

**Get dashboard detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/{dashboard_id}/"
```

Returns dashboard metadata and tiles (each tile references an insight).

**Create dashboard** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product KPIs","description":"Key product metrics","tags":["product"]}' \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/"
```

**Update dashboard** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","tiles":[...]}' \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/{dashboard_id}/"
```

Tiles map insight IDs to layout coordinates.

**Delete dashboard** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/dashboards/{dashboard_id}/"
```

This is destructive. Only run when the user explicitly asks to delete a specific dashboard. Deleting a dashboard does not delete the underlying insights.
