---
name: jali-staging
description: ALWAYS ACTIVE for Jali staging work. Prefer this overlay over jali for staging authentication, credential renewal, and JALA reads or changes; require JALI_JALA_BASE_URL to point at staging and use session-scoped credentials.
metadata:
  author: felix-agent
  kind: operational
  version: "2.0.0"
env:
  - key: JALI_JALA_BASE_URL
    description: Required JALA HTTPS origin for this staging deployment: https://staging-app.jala.tech
    required: true
    secret: false
---

# Jali staging

## Purpose

Extend the base [`jali`](../jali/SKILL.md) skill for staging. Reuse its
authentication, JALA request helper and use cases; this overlay owns only the
staging origin mapping and selection priority. Deploy both skill folders.

## When to use

Use for Jali staging conversations, including staging authentication, renewed
credentials, data lookup and changes. Select this overlay before following the
base workflow, including its status check.

## Out of scope

Production requests, copying production credentials, and duplicating the base
helper or API recipes. This overlay adds no service or database. The base skill owns session-attachment authentication and renewal.

## Use Cases

- **Authenticate a staging thread:** map the environment, then follow the base
  [authentication case](../jali/references/use-cases/authenticate-thread.md).
- **Read or change staging data:** map the environment, then follow the base
  [read](../jali/references/use-cases/read-data.md) or
  [change](../jali/references/use-cases/change-data.md) case.
- **Renew or disconnect staging access:** map the environment, then follow the
  base [renewal case](../jali/references/use-cases/renew-authentication.md).

## Permissions

Use the base skill's requester identity, API authorization and cooperating
secret-handling permission rules. This overlay grants no additional authority.

## Workflow

1. Confirm the base skill is installed. If missing, report the dependency.
2. Before **every** base helper command, confirm `JALI_JALA_BASE_URL` is set to
   `https://staging-app.jala.tech`. Run from the base skill folder:

   ```bash
   test "${JALI_JALA_BASE_URL:-}" = "https://staging-app.jala.tech" || { echo "Configure JALI_JALA_BASE_URL for staging" >&2; exit 1; }
   python3 scripts/jali.py --event-file <current_event> status
   ```

   Replace `status` with the base command for the selected operation. Repeat
   the origin check for authenticate, request, renewal and disconnect. A
   missing or non-staging URL stops the command.
3. Follow the base skill and selected use case with the mapped environment.
   Return only safe helper results; preserve its identity checks, redaction,
   verification and uncertain-write behavior.

## Environment

The Owner configures `JALI_JALA_BASE_URL` on the staging deployment as
`https://staging-app.jala.tech`. Production uses the same variable name on its
own deployment with `https://app.jala.tech`. Supply an HTTPS origin without
`/api`, path, query, fragment or embedded credentials. All staging profile
validation and JALA requests must use the staging origin.

The base helper retains each session's accepted native upload and stores a
secret-free pointer in that session. No shared private credential directory or
production credential fallback is used. An origin change requires fresh
session authentication.

## Checks

- Base skill present and staging URL configured before any helper command.
- The environment mapping applied in that invocation; generic variables are
  never the source of staging configuration or fallback credentials.
- Native session storage persists through container recreation.
- Widget backend uses the same JALA origin before provisioning staging users.
- No credential content appears in chat, diagnostics or helper arguments.
