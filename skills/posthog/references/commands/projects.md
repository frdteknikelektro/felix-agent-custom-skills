# Projects

**List all projects** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/"
```

Returns all projects across all organizations the key can access. Use this for project discovery.

**Get project detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/"
```

**Update project settings** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","is_demo":false}' \
  "https://app.posthog.com/api/projects/{project_id}/"
```

**Create project** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-project","organization_id":"{org_id}"}' \
  "https://app.posthog.com/api/projects/"
```
