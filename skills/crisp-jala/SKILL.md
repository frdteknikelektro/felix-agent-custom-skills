---
name: crisp-jala
description: Jala Crisp customer messaging and workspace operations through the REST API. Use for Jala conversations, messages, people profiles, visitors, operators, inboxes, campaigns, analytics, or profile exports.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: crisp jala, jala crisp, Jala Crisp, Jala conversation, Jala Crisp message, Jala Crisp people profile, Jala Crisp visitor, Jala Crisp inbox
env:
  - key: CRISP_JALA_TOKEN_ID
    description: Jala Crisp website-token identifier or plugin-token identifier.
    required: true
    secret: true
  - key: CRISP_JALA_TOKEN_KEY
    description: Jala Crisp website-token secret or plugin-token key.
    required: true
    secret: true
  - key: CRISP_JALA_TOKEN_TIER
    description: Jala Crisp authentication tier; use website for one workspace or plugin for multi-workspace access.
    default: website
    required: true
    secret: false
  - key: CRISP_JALA_WEBSITE_ID
    description: Exact Jala Crisp workspace identifier. This overlay defines no canonical workspace ID.
    required: true
    secret: false
  - key: CRISP_JALA_API_BASE_URL
    description: Jala Crisp REST API host.
    default: https://api.crisp.chat
---

# Crisp Jala

## Purpose

Route Jala Crisp work through the base [`crisp`](../crisp/SKILL.md) skill with Jala-only credentials and an exact Jala workspace boundary.

## When to use

Use when the request names Jala Crisp, Jala conversations, Jala Crisp messages, Jala people profiles, or Jala workspace data. Deploy this overlay together with the base `crisp` skill.

## Out of scope

- Recreating Crisp endpoint recipes or API schemas; use the base skill’s branch references.
- Defining or guessing a canonical Jala `website_id`, conversation, session, message, people profile, inbox, operator, campaign, or export target; this overlay defines none.
- Using generic `CRISP_*` values as the source credentials.

## Use Cases

- **Operate a Jala conversation** — resolve the exact Jala workspace and session, then follow the base conversations branch.
- **Manage Jala people data** — resolve the exact profile or export scope, then follow the base people branch.
- **Inspect Jala workspace operations** — follow the base workspace and analytics branch for operators, inboxes, campaigns, or metrics.

## Permissions

Use the base skill’s local `read`, `send`, and `write` permissions. Felix evaluates grants under `crisp-jala:` for this overlay. The base skill’s confirmation rule applies to every Jala send and state-changing write; destructive confirmation applies to every Jala deletion.

## Workflow

1. **Authorize.** Resolve the operation against this skill’s local permission using Felix’s server-computed `permissions_per_skill` row. If it is under `need=[...]`, emit one `PERMISSION_REQUIRED` block with skill `crisp-jala` and stop.
   Completion: the operation permission is authorized, or the complete permission request is emitted.
2. **Map credentials.** Before any Crisp API call, map only the Jala variables:

   ```bash
   export CRISP_TOKEN_ID="$CRISP_JALA_TOKEN_ID"
   export CRISP_TOKEN_KEY="$CRISP_JALA_TOKEN_KEY"
   export CRISP_TOKEN_TIER="${CRISP_JALA_TOKEN_TIER:-website}"
   export CRISP_WEBSITE_ID="$CRISP_JALA_WEBSITE_ID"
   export CRISP_API_BASE_URL="${CRISP_JALA_API_BASE_URL:-https://api.crisp.chat}"
   ```

   Keep both Jala token values secret. Never source generic Crisp variables as the credential source.
   Completion: mapped variables are present without exposing their values.
3. **Resolve Jala context.** Confirm the exact Jala `website_id`, token tier, operation, target identifier, and payload. This repository defines no canonical Jala workspace ID.
   Completion: one concrete Jala workspace and target are resolved, or one focused clarification is required.
4. **Delegate.** Read and follow [`crisp/SKILL.md`](../crisp/SKILL.md) and its selected branch reference. Preserve the base skill’s token-tier, scope, confirmation, deletion, pagination, redaction, and verification rules.
   Completion: the Jala credential context is ready and the base branch is selected.
5. **Execute and report.** Run the base workflow with the mapped Jala variables. Report the Jala workspace, returned identifiers, observed state, and any redacted API failure.
   Completion: the requested Jala state is observed and reported, or the smallest next step is reported.

## Environment

Jala variables are the only credential source:

- `CRISP_JALA_TOKEN_ID` — required Jala Crisp token identifier; never print it.
- `CRISP_JALA_TOKEN_KEY` — required Jala Crisp token secret/key; never print it.
- `CRISP_JALA_TOKEN_TIER` — optional `website` or `plugin` tier; defaults to `website`.
- `CRISP_JALA_WEBSITE_ID` — exact Jala workspace identifier; required for every website-scoped request.
- `CRISP_JALA_API_BASE_URL` — optional Crisp API host; defaults to `https://api.crisp.chat`.

Every command must map `CRISP_JALA_*` to the base `CRISP_*` names first. Never map generic Crisp variables into themselves.

## Checks

- Confirm the base `crisp` skill is available before operating; if missing, report the dependency and stop.
- Keep Jala token values private and preserve the selected website/plugin tier.
- Use the base skill’s `scripts/crisp_api.py` transport script for every Jala request.
- Confirm the exact Jala `website_id` immediately before every send or state-changing write; obtain destructive confirmation before any deletion.
- Recheck the official Crisp link in the selected base reference when endpoint behavior, route scope, or token quota may have changed.
- Redact tokens, conversation content, profile data, emails, phone numbers, visitor data, export details, and attachments.
