# Surveys

**List surveys** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/surveys/"
```

**Get survey detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/surveys/{survey_id}/"
```

Returns questions, targeting rules, appearance config, schedule.

**Create survey** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"NPS Survey","description":"Net Promoter Score","type":"popover","questions":[{"type":"rating","question":"How likely are you to recommend?","scale":10}]}' \
  "https://app.posthog.com/api/projects/{project_id}/surveys/"
```

**Update survey** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  "https://app.posthog.com/api/projects/{project_id}/surveys/{survey_id}/"
```

**Delete survey** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/surveys/{survey_id}/"
```

**Get survey responses** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/surveys/{survey_id}/responses/"
```
