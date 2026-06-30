# Session Recordings

**List session recordings** (`posthog.read`):

```bash
curl -s -G \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  --data-urlencode 'date_from=2024-06-01T00:00:00Z' \
  --data-urlencode 'date_to=2024-06-02T00:00:00Z' \
  --data-urlencode 'duration_min=30' \
  "https://app.posthog.com/api/projects/{project_id}/session_recordings/"
```

Filtering options:
- `date_from` / `date_to` — time window (ISO 8601 required)
- `duration_min` / `duration_max` — session length in seconds
- `person_uuid` — filter by person
- `events` — filter by events that occurred during the session (URL-encoded JSON array)
- `properties` — filter by session properties (URL-encoded JSON array)

**Get recording detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/session_recordings/{recording_id}/"
```

Returns metadata: duration, click count, console log count, start/end URLs.

**List recording playlists** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/session_recording_playlists/"
```

**Create recording playlist** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bug Reports","derived_name":"Bug Reports","pinned":false}' \
  "https://app.posthog.com/api/projects/{project_id}/session_recording_playlists/"
```

Recordings are read-only via API — you cannot create, modify, or delete session recordings themselves.
