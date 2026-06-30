# Insights

**List insights** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/insights/"
```

**Get insight detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/insights/{insight_id}/"
```

Returns the full insight configuration including kind, filters, series, and result data.

Insight kinds:
- `TRENDS` — time-series charts of events or actions
- `FUNNELS` — conversion between ordered steps
- `RETENTION` — cohort-based retention analysis
- `PATHS` — user journey flow between pages/screens
- `LIFECYCLE` — new, returning, resurrecting, and dormant users
- `STICKINESS` — DAU/WAU/MAU or repeat usage metrics

**Create insight** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Insight","filters":{"events":[{"id":"$pageview","type":"events","name":"$pageview"}],"date_from":"-7d"},"saved":true}' \
  "https://app.posthog.com/api/projects/{project_id}/insights/"
```

Creating insights requires understanding the nested filter format. When the user wants to "create an insight like X", first GET an existing similar insight to understand the payload shape, then adapt it. Do not invent the filter structure from scratch.

**Update insight** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  "https://app.posthog.com/api/projects/{project_id}/insights/{insight_id}/"
```

**Delete insight** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/insights/{insight_id}/"
```

This is destructive. Only run when the user explicitly asks to delete a specific insight.
