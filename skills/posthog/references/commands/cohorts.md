# Cohorts

**List cohorts** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/"
```

**Get cohort detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/{cohort_id}/"
```

**Create static cohort** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Beta Users","is_static":true}' \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/"
```

**Create dynamic cohort** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Power Users","is_static":false,"filters":{"properties":{"type":"AND","values":[{"key":"signed_up","type":"person","value":"is_set","operator":"is_set"}]}}}' \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/"
```

Dynamic cohorts recalculate periodically based on behavioral or property filters. Static cohorts use an explicit list of user IDs.

**Update cohort** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/{cohort_id}/"
```

**Delete cohort** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/cohorts/{cohort_id}/"
```
