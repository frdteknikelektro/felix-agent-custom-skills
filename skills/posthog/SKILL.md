---
id: posthog
name: PostHog Analytics Management
description: Full PostHog management via REST API — events, feature flags, insights, dashboards, persons, cohorts, annotations, surveys, experiments, session recordings, HogQL queries, and taxonomy. Uses POSTHOG_PERSONAL_KEY (available in environment). Uses text-based read/write permission guidance.
version: 1
enabled: true
kind: operational
permissions:
  - posthog.read
  - posthog.write
env:
  - key: POSTHOG_PERSONAL_KEY
    description: PostHog personal API key for API requests
    required: true
  - key: POSTHOG_PROJECT_KEY
    description: PostHog project key (only needed for public capture/decide endpoints)
    required: false
match:
  - posthog
  - feature flag
  - feature flags
  - feature toggle
  - hogql
  - session replay
  - session replays
  - posthog event
  - posthog events
  - posthog analytics
  - posthog dashboard
  - posthog insight
  - posthog cohort
  - posthog survey
  - posthog experiment
  - posthog person
  - posthog capture
---

# PostHog Analytics Management

## Purpose

Operate PostHog through the REST API using `curl`. This skill covers events, feature flags, insights, dashboards, persons, cohorts, annotations, surveys, experiments, session recordings, HogQL queries, and schema management. It is generic — no default project or organization.

The PostHog REST API is comprehensive (100% feature parity with the UI). There is no mature CLI — all operations use `curl` with Bearer token auth against `https://app.posthog.com/api`.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for PostHog read/write classification.

## When to use

Activate when the user asks to query PostHog events, manage feature flags, view/create dashboards, inspect persons/cohorts, run HogQL queries, manage surveys or experiments, view session recordings, or manage PostHog schema/taxonomy.

## Out of scope

- Self-hosted PostHog instances (only `app.posthog.com` is supported)
- Real-time event ingestion pipelines
- PostHog SDK integration or client-side setup
- Billing or organization membership management

## Use cases

- **Query events**: user asks "show me pageviews yesterday" → `GET /api/projects/{id}/events/?after=-1d`
- **Create feature flag**: user asks "create a flag for new checkout" → `POST /api/projects/{id}/feature_flags/`
- **Run HogQL query**: user asks "top events this week" → `POST /api/projects/{id}/query/`
- **List dashboards**: user asks "what dashboards exist" → `GET /api/projects/{id}/dashboards/`
- **View session recordings**: user asks "recordings with errors" → `GET /api/projects/{id}/session_recordings/`
- **Create experiment**: user asks "A/B test the new onboarding" → `POST /api/projects/{id}/experiments/`

## Permissions

Use the requested intent and the likely PostHog effect to choose the required permission:

Request the bare permission shown below; Felix stores grants under this skill id.

- `posthog.read` — inspection, listing, viewing, searching, querying, downloading exports. Examples: list projects, list organizations, view insight, get feature flag, list events, query person, run HogQL query, list session recordings, get dashboard, view annotation, list cohorts, view survey, get experiment results, list event definitions, list property definitions.
- `posthog.write` — creating, updating, or deleting anything in PostHog. Examples: create feature flag, toggle flag, update cohort, delete dashboard, capture event, create insight, patch person properties, set annotation, launch experiment, create survey.

If an operation is ambiguous, treat it as `posthog.write` unless the user is only asking to inspect or explain current state.

**HogQL queries are `posthog.read`** — they are analytical read-only operations (the POST method is an API quirk, not a write indicator). Warn if the HogQL query targets person properties that may contain PII.

**Destructive operations** are allowed only when the user explicitly asks for the specific destructive intent: `DELETE` on feature flags, insights, dashboards, cohorts, surveys, experiments, annotations, or persons. These must be explicitly named by the user — never infer deletion.

## Workflow

0. **Resolve permissions FIRST.** Before doing anything else — before running any API call — determine whether the user has permission for the requested work. If permission is missing, emit PERMISSION_REQUIRED. Never skip this step.
1. Classify the requested work as read or write using the permission policy above.
2. Export `POSTHOG_PERSONAL_KEY`, and verify with `GET /api/users/@me/`. If the key is invalid, report it and stop.
3. Discover the project context. Most endpoints require a `project_id` in the URL. Never guess a project ID. List projects with `GET /api/projects/` and let the user confirm. Optionally scope by organization first with `GET /api/organizations/`.
4. Execute the operation. Include `-H "Authorization: Bearer $POSTHOG_PERSONAL_KEY"` and `-H "Content-Type: application/json"` on every request.
5. Report results concisely. Include project name, ID, relevant counts, and key values.
6. Follow cursor pagination automatically for small result sets (under ~500 items). For large sets, tell the user how many pages remain and ask if they want to continue.

## Environment

Use tokens from the environment before every PostHog API call. Do not use credential files.

Required variable:
- `POSTHOG_PERSONAL_KEY` — private API key for management CRUD (prefix `phx_`)

Optional variable:
- `POSTHOG_PROJECT_KEY` — only for public endpoints (`/i/v0/e/` capture, `/decide/` flag eval)

Command pattern:

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"
```

Verify the key is valid before any PostHog work:

```bash
test -n "$POSTHOG_PERSONAL_KEY" &&
export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY" &&
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/users/@me/"
```

If the response is not `200`, check that `POSTHOG_PERSONAL_KEY` is set, valid, and has the correct `phx_` prefix. Never print the key value.

API base URL: `https://app.posthog.com`
All requests use: `-H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" -H "Content-Type: application/json"`

## Operation references

Keep this file for routing, permission policy, environment setup, output rules, and completion checks. Load only the reference needed for the requested branch:

- **Auth & Identity** — read [auth-and-identity](references/commands/auth-and-identity.md).
- **Organizations** — read [organizations](references/commands/organizations.md).
- **Projects** — read [projects](references/commands/projects.md).
- **Events** — read [events](references/commands/events.md).
- **Feature Flags** — read [feature-flags](references/commands/feature-flags.md).
- **Insights** — read [insights](references/commands/insights.md).
- **Dashboards** — read [dashboards](references/commands/dashboards.md).
- **Persons** — read [persons](references/commands/persons.md).
- **Cohorts** — read [cohorts](references/commands/cohorts.md).
- **Annotations** — read [annotations](references/commands/annotations.md).
- **Surveys** — read [surveys](references/commands/surveys.md).
- **Experiments** — read [experiments](references/commands/experiments.md).
- **Session Recordings** — read [session-recordings](references/commands/session-recordings.md).
- **HogQL Queries** — read [hogql-queries](references/commands/hogql-queries.md).
- **Schema & Taxonomy** — read [schema-and-taxonomy](references/commands/schema-and-taxonomy.md).
- **Groups** — read [groups](references/commands/groups.md).
- **Pagination & Filtering** — read [pagination-and-filtering](references/commands/pagination-and-filtering.md).
- **Cursor Pagination** — read [cursor-pagination](references/commands/cursor-pagination.md).
- **Time Format** — read [time-format](references/commands/time-format.md).
- **Property Filters** — read [property-filters](references/commands/property-filters.md).
- **Ordering** — read [ordering](references/commands/ordering.md).
- **Quick Examples** — read [quick-examples](references/commands/quick-examples.md).
- **Verify auth** — read [verify-auth](references/commands/verify-auth.md).
- **List projects** — read [list-projects](references/commands/list-projects.md).
- **Query events from yesterday** — read [query-events-from-yesterday](references/commands/query-events-from-yesterday.md).
- **Query events with name filter** — read [query-events-with-name-filter](references/commands/query-events-with-name-filter.md).
- **List feature flags** — read [list-feature-flags](references/commands/list-feature-flags.md).
- **Create feature flag** — read [create-feature-flag](references/commands/create-feature-flag.md).
- **List dashboards** — read [list-dashboards](references/commands/list-dashboards.md).
- **Run HogQL query** — read [run-hogql-query](references/commands/run-hogql-query.md).
- **List event definitions** — read [list-event-definitions](references/commands/list-event-definitions.md).

For any mutating branch, completion requires the requested remote state to be observed directly or by a follow-up read when the platform exposes one.

## Output

- Keep replies concise and operational.
- Include project name, project ID, and relevant identifiers.
- For lists, use a compact format: one line per item with ID + name + key detail.
- When listing events, include timestamp and event name. For large result sets, summarize with counts.
- Report errors with the exact `curl` method + URL attempted, the HTTP status code, and the PostHog error detail (if available in the response body).
- Never print the `POSTHOG_PERSONAL_KEY`, `POSTHOG_PROJECT_KEY`, or any credential value.
- Separate confirmed PostHog facts from assumptions or conclusions.
- If blocked by missing key or API errors, state the blocker and the smallest next step.

## Checks

- Always export `POSTHOG_PERSONAL_KEY` before any API call.
- Always verify the key with `GET /api/users/@me/` before doing real work.
- Always confirm the `project_id` before running a project-scoped operation. Never guess.
- Never print credential values, tokens, or API key values.
- Destructive operations (any `DELETE`) must be explicitly requested by the user before proceeding.
- Use `--data-urlencode` for JSON query parameters in GET requests to avoid curl escaping issues.
- PostHog enforces a time window on queries. Default to last 7 days if the user doesn't specify.
- HogQL queries against `persons` or `events` tables may contain PII. Warn the user.
- Feature flag changes take effect instantly. The permission gate must be strict.
- Tokens are in the environment.

## Cross-skill convention

Other skills that need PostHog operations (querying events, checking feature flags, reading dashboards) should not embed their own `curl` calls. Route PostHog work through this skill.
