---
id: posthog-jala
name: PostHog Jala Management
description: "Query and manage Jala's PostHog analytics (orgs 10590, 28053) via REST API — events, feature flags, dashboards, HogQL."
version: 1
enabled: true
kind: operational
permissions:
  - posthog.read
  - posthog.write
env:
  - key: POSTHOG_JALA_PERSONAL_KEY
    description: PostHog personal API key for Jala org (exported as POSTHOG_PERSONAL_KEY)
    required: true
  - key: POSTHOG_JALA_PROJECT_KEY
    description: PostHog project key for Jala (exported as POSTHOG_PROJECT_KEY)
    required: false
match:
  - posthog jala
  - jala posthog
  - jala analytics
  - jala event
  - jala feature flag
  - jala dashboard
  - jala insight
  - jala cohort
  - jala session
  - jala capture
  - jala hogql
  - jala survey
  - jala experiment
---

# PostHog Jala Management

## Purpose

Operate Jala's PostHog analytics through the REST API. This skill extends the base `posthog` skill. Every operation, permission policy, destructive-operation gate, and API pattern is identical. This skill only overrides the credential contract, the Jala organization/project context, and qualified match rules.

**Execution:** Resolve permissions first (emit PERMISSION_REQUIRED if missing). Map `POSTHOG_JALA_PERSONAL_KEY` → `POSTHOG_PERSONAL_KEY` and verify with `GET /api/users/@me/` before any API call. Then follow the base `posthog` skill's execution steps.

**Jala organizations**:
- **Jala** — org ID `10590`
- **Jala Widget** — org ID `28053`

The Jala personal key (`POSTHOG_JALA_PERSONAL_KEY`) has access to both organizations. Detailed project listings are in `references/jala-context.md`.

Do not duplicate operation documentation. This file documents only what is different.

## When to use

Activate when the user asks to query PostHog specifically for Jala's organization (orgs 10590 or 28053). Trigger words include "posthog jala", "jala analytics", "jala event", "jala feature flag", "jala dashboard".

## Out of scope

- Non-Jala PostHog organizations or projects — route to the base `posthog` skill
- Operations not covered by the PostHog REST API

## Use cases

- **Query Jala events**: user asks "show me Jala pageviews yesterday" → list Jala projects, then query events for that project
- **Create Jala feature flag**: user asks "create a flag for Jala checkout" → `POST /api/projects/{id}/feature_flags/`
- **List Jala dashboards**: user asks "what dashboards exist for Jala" → `GET /api/projects/{id}/dashboards/`
- **Run HogQL on Jala data**: user asks "top Jala events this week" → `POST /api/projects/{id}/query/`

## Permissions

Same permission policy as the base `posthog` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `posthog.read` — inspection, listing, viewing, searching, querying, downloading.
- `posthog.write` — create, update, delete, toggle, launch, patch.

If an operation is ambiguous, treat it as `posthog.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks — same gating as the base skill.

## Environment (overrides base)

Tokens are in the environment. The Jala org uses its own API keys:

- `POSTHOG_JALA_PERSONAL_KEY` — Jala-specific private API key for management CRUD (prefix `phx_`)
- `POSTHOG_JALA_PROJECT_KEY` — Jala-specific project key (only for capture endpoints, optional)

Credential mapping pattern:

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_JALA_PERSONAL_KEY"
test -n "$POSTHOG_JALA_PROJECT_KEY" && export POSTHOG_PROJECT_KEY="$POSTHOG_JALA_PROJECT_KEY"
```

Verify the Jala key before any work:

```bash
test -n "$POSTHOG_JALA_PERSONAL_KEY" &&
export POSTHOG_PERSONAL_KEY="$POSTHOG_JALA_PERSONAL_KEY" &&
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/users/@me/"
```

Note: the base `posthog` skill reads `POSTHOG_PERSONAL_KEY` from the environment. The Jala value is mapped in: `POSTHOG_PERSONAL_KEY="$POSTHOG_JALA_PERSONAL_KEY"`. Never print the key value.

## Jala Organization & Project Context

When the user does not specify which organization or project, default to the Jala orgs:

1. **List Jala projects**: Query projects from both orgs:
   ```bash
   curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
     "https://app.posthog.com/api/organizations/10590/projects/"
   ```
   and
   ```bash
   curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
     "https://app.posthog.com/api/organizations/28053/projects/"
   ```

2. **If the user names a project**, match by name across both orgs. If there's ambiguity (same name in both orgs), list both and ask which one.

3. **Fall back** to `GET /api/projects/` for the full list if the org-scoped listing is insufficient.

4. **Consult `references/jala-context.md`** for known project IDs and naming conventions. This file is best-effort — if a project ID returns 404, re-list projects via API to get the current state.

5. Once `project_id` is confirmed, cache it for the current session (do not re-ask).

When listing projects, include the org name so the user can disambiguate between Jala and Jala Widget.

## Operations

Read [../posthog/SKILL.md](../posthog/SKILL.md) for any operation not documented here.

Every `curl` command must map `POSTHOG_JALA_PERSONAL_KEY` → `POSTHOG_PERSONAL_KEY`.

## Quick Examples

Every example maps `POSTHOG_JALA_PERSONAL_KEY` to `POSTHOG_PERSONAL_KEY`:

```bash
export POSTHOG_PERSONAL_KEY="$POSTHOG_JALA_PERSONAL_KEY"
```

- `GET /api/users/@me/` — verify auth
- `GET /api/projects/{project_id}/events/?after=-1d&limit=10` — query events
- `GET /api/projects/{project_id}/feature_flags/` — list feature flags
- `POST /api/projects/{project_id}/feature_flags/` — create a feature flag
- `POST /api/projects/{project_id}/query/` — run HogQL query

See base `posthog` SKILL.md for full curl syntax and response handling.

## Output

Same as base `posthog` skill. Keep replies concise and operational. Include project name, ID, and relevant counts. Never print `POSTHOG_JALA_PERSONAL_KEY`, `POSTHOG_PERSONAL_KEY`, or any credential value.
