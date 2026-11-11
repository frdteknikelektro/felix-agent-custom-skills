---
name: jali-staging
description: >-
  Use for JALA authentication and data requests against
  https://staging-app.jala.tech. Select before jali; this overlay maps the
  shared Jali workflow to the staging origin.
metadata:
  author: felix-agent
  kind: operational
  version: "2.1.0"
  match: https://staging-app.jala.tech, staging JALA, staging authentication, staging credentials, staging data, JALI_STAGING_JALA_BASE_URL
env:
  - key: JALI_STAGING_JALA_BASE_URL
    description: Staging JALA HTTPS origin; must be https://staging-app.jala.tech without /api
    required: true
    secret: false
---

# Jali staging

## Purpose

Route JALA staging work through the base `jali` workflow while pinning every helper request to `https://staging-app.jala.tech`.

## When to use

Select this overlay before `jali` when the requested JALA target is `https://staging-app.jala.tech`, or the request explicitly names the staging JALA environment. It covers staging authentication, reads, changes, renewal and disconnect.

## Out of scope

Production requests, production credential fallback, and changes to the shared base helper. If the target environment is unknown, establish it before any JALA operation.

## Use Cases

Use the corresponding base case after applying the staging origin:

- Authenticate a staging thread: [authentication](../jali/references/use-cases/authenticate-thread.md).
- Read staging data: [read JALA data](../jali/references/use-cases/read-data.md).
- Change staging data: [change JALA data](../jali/references/use-cases/change-data.md).
- Renew or disconnect staging access: [renew authentication](../jali/references/use-cases/renew-authentication.md).

## Permissions

This overlay requires no permission grant and adds no authority. The base skill's verified requester identity, JALA API permissions, and any cooperating skill's own permission rules still apply.

## Workflow

1. **Confirm the staging origin.** Require `JALI_STAGING_JALA_BASE_URL` to be configured as exactly `https://staging-app.jala.tech`. Stop if it is missing or points elsewhere.
   Completion: the configured value matches the staging origin exactly.
2. **Run the base helper with a per-command override.** For each helper command, run this pattern with the exact current `--event-file` and selected subcommand:
   ```bash
   cd "${WORKSPACE_DIR:?}/.agents/skills/jali" &&
   test "${JALI_STAGING_JALA_BASE_URL:?Configure JALI_STAGING_JALA_BASE_URL}" = "https://staging-app.jala.tech" &&
   JALI_JALA_BASE_URL="$JALI_STAGING_JALA_BASE_URL" python3 scripts/jali.py --event-file <current_event> status
   ```
   Start with `status` before any other JALA operation. Repeat the origin check and environment mapping for authenticate, request, renewal and disconnect rather than relying on shell state.
   Completion: the helper reports the status/result for the current thread while using the staging origin.
3. **Follow the base use case.** Return only safe helper results and preserve the base skill's identity checks, secret handling, write verification and uncertain-write behavior.
   Completion: the requested staging operation is verified, or its failure is reported without fallback to production.

## Environment

`JALI_STAGING_JALA_BASE_URL` is required and must be the HTTPS origin `https://staging-app.jala.tech`, without `/api`, path, query, fragment or embedded credentials. A `jali-auth.json` that declares this origin (the widget's) authenticates the thread on staging without the override, and the thread keeps that origin for every later call. The overlay maps it to `JALI_JALA_BASE_URL` only for each helper process. The base helper appends `/api/...`. This per-command mapping keeps the production base value unchanged.

## Checks

- Base `jali` skill and the current event file are available before calling the helper.
- Every helper process receives the staging origin; no command inherits or falls back to the production origin.
- The widget backend's credential validation and this skill use the same staging origin.
- Credential values remain opaque; no credential content appears in replies, diagnostics or helper arguments.
