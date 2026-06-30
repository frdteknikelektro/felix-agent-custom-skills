# Events

The Events API is the most commonly used operation. PostHog enforces a time window on all event queries.

#### Capture Events

**Capture single event** (`posthog.write`, uses `POSTHOG_PROJECT_KEY`):

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"api_key":"$POSTHOG_PROJECT_KEY","event":"user_signed_up","distinct_id":"user_123","properties":{"plan":"pro"}}' \
  "https://app.posthog.com/i/v0/e/"
```

**Capture batch events** (`posthog.write`, uses `POSTHOG_PROJECT_KEY`):

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"api_key":"$POSTHOG_PROJECT_KEY","batch":[{"event":"pageview","distinct_id":"user_1","properties":{}},{"event":"click","distinct_id":"user_2","properties":{}}]}' \
  "https://app.posthog.com/batch/"
```

The `POSTHOG_PROJECT_KEY` is a public token — rate limits do not apply to capture endpoints.

#### Query Events

**List events** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/events/?after=2024-01-01T00:00:00Z&before=2024-01-02T00:00:00Z"
```

Query parameters:

| Parameter | Format | Description |
|---|---|---|
| `after` | ISO 8601 or relative (`-7d`, `-24h`, `-30d`) | Start of time window (required) |
| `before` | ISO 8601 | End of time window (optional, defaults to now) |
| `event` | string | Filter by event name (e.g., `$pageview`, `user_signed_up`) |
| `properties` | URL-encoded JSON array | Property filters |
| `distinct_id` | string | Filter by distinct ID |
| `person_id` | UUID | Filter by person UUID |
| `orderBy` | field name | Sort (prefix with `-` for descending, e.g., `-timestamp`) |
| `limit` | integer | Results per page |
| `select` | comma-separated fields | Return only specific fields (timestamp, event, properties, person, distinct_id) |

**Property filter syntax** — passed as `?properties=...` (URL-encoded):

```json
[
  {"key":"$browser","operator":"exact","value":"Chrome","type":"event"},
  {"key":"plan","operator":"icontains","value":"pro","type":"event"}
]
```

Supported operators: `exact`, `iexact`, `icontains`, `regex`, `gt`, `gte`, `lt`, `lte`, `is_set`, `is_not_set`, `is_date_exact`, `is_date_after`, `is_date_before`. Combine filters with `AND` or `OR` by wrapping them.

**Time window is required**: If the user does not specify a time range, default to the last 7 days (`after=-7d`) and state this clearly in the response. Do not guess wider windows.

**Date handling**: Always use ISO 8601 format in UTC (`2024-01-15T00:00:00Z`). When the user says "yesterday", "last week", "last month", compute the equivalent ISO 8601 range. PostHog also supports relative shorthand: `-24h`, `-7d`, `-30d`, `-90d`.

**Pagination**: Response includes a `next` field with the cursor URL. Follow it to get subsequent pages:

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "{next_url_from_response}"
```

**Common PostHog events** (prefix `$` denotes internal events):
`$pageview`, `$pageleave`, `$autocapture`, `$identify`, `$feature_flag_called`, `$survey_shown`, `$survey_dismissed`, `$experiment_participation`

**Example — events with time and properties** (`posthog.read`):

```bash
curl -s -G \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  --data-urlencode 'after=2024-06-01T00:00:00Z' \
  --data-urlencode 'before=2024-06-02T00:00:00Z' \
  --data-urlencode 'event=$pageview' \
  --data-urlencode 'properties=[{"key":"$browser","operator":"exact","value":"Chrome","type":"event"}]' \
  --data-urlencode 'limit=50' \
  "https://app.posthog.com/api/projects/{project_id}/events/"
```
