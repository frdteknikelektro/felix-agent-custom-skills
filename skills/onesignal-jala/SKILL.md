---
name: onesignal-jala
description: Jala OneSignal messaging and user operations through the REST API. Use for Jala push, email, or SMS messages; Jala users, aliases, tags, subscriptions, message reports, or app inventory.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: onesignal jala, jala onesignal, Jala OneSignal, Jala push, Jala notification, Jala OneSignal user, Jala OneSignal subscription, Jala OneSignal message
env:
  - key: ONESIGNAL_JALA_APP_ID
    description: Exact Jala OneSignal App ID. Public identifier, but required to select the Jala app data boundary.
    required: true
    secret: false
  - key: ONESIGNAL_JALA_APP_API_KEY
    description: Jala OneSignal App API Key used with the Key authorization scheme.
    required: true
    secret: true
  - key: ONESIGNAL_JALA_ORG_API_KEY
    description: Optional Jala OneSignal Organization API Key for organization-scoped app inventory requests.
    required: false
    secret: true
  - key: ONESIGNAL_JALA_API_BASE_URL
    description: Jala OneSignal API host.
    default: https://api.onesignal.com
---

# OneSignal Jala

## Purpose

Route Jala OneSignal work through the base [`onesignal`](../onesignal/SKILL.md) skill with Jala-only credentials and an exact Jala App ID.

## When to use

Use when the request names Jala OneSignal, Jala push/email/SMS messaging, Jala users or subscriptions, or Jala message delivery data. Deploy this overlay together with the base `onesignal` skill.

## Out of scope

- Recreating OneSignal endpoint recipes or API schemas; use the base skill’s branch references.
- Defining or guessing a canonical Jala App ID, user alias, subscription, segment, message, or organization; require the exact supplied target or injected variable.
- Using generic `ONESIGNAL_*` values as the source credentials.

This overlay does not define a canonical Jala App ID or organization.

## Use Cases

- **Send a Jala message** — resolve the exact Jala App ID, channel, audience, content, and schedule, then follow the base messaging branch.
- **Manage Jala users or subscriptions** — resolve the exact alias or subscription and requested action, then follow the base users branch.
- **Inspect Jala delivery** — resolve the exact Jala message ID and app, then follow the base messages branch.
- **Inspect Jala apps** — use the optional Jala Organization API Key only when the request is organization-scoped.

## Permissions

Use the base skill’s local `read`, `send`, and `write` permissions. Felix evaluates grants under `onesignal-jala:` for this overlay. The base skill’s confirmation rule applies to every Jala send and state-changing write; cancellation and deletion require destructive confirmation.

## Workflow

1. **Authorize.** Resolve the operation against this skill’s local permission using Felix’s server-computed `permissions_per_skill` row. If it is under `need=[...]`, emit one `PERMISSION_REQUIRED` block with skill `onesignal-jala` and stop.
   Completion: the operation permission is authorized, or the complete permission request is emitted.
2. **Map credentials.** Before any OneSignal API call, map only the Jala variables:

   ```bash
   export ONESIGNAL_APP_ID="$ONESIGNAL_JALA_APP_ID"
   export ONESIGNAL_APP_API_KEY="$ONESIGNAL_JALA_APP_API_KEY"
   export ONESIGNAL_API_BASE_URL="${ONESIGNAL_JALA_API_BASE_URL:-https://api.onesignal.com}"
   if [ -n "${ONESIGNAL_JALA_ORG_API_KEY:-}" ]; then
     export ONESIGNAL_ORG_API_KEY="$ONESIGNAL_JALA_ORG_API_KEY"
   fi
   ```

   Keep all Jala keys private; never source a credential file or use generic OneSignal variables as the source.
   Completion: mapped variables are present without exposing their values.
3. **Resolve Jala context.** Use the exact Jala App ID, channel, audience, alias, subscription, message, or organization target supplied by the user or environment. This repository defines no canonical Jala OneSignal app or organization.
   Completion: one concrete Jala app boundary and operation are resolved, or one focused clarification is required.
4. **Delegate.** Read and follow [`onesignal/SKILL.md`](../onesignal/SKILL.md) and its selected branch reference. Preserve the base distinction between App API Key and Organization API Key, and do not run an organization-level request with only the app credential.
   Completion: the Jala credential context is ready and the base branch is selected.
5. **Execute and report.** Run the base workflow with the mapped Jala variables and preserve its exact-target, confirmation, redaction, rate-limit, asynchronous-deletion, and accepted-versus-delivered rules.
   Completion: the requested Jala state is observed and reported, or the redacted API failure and smallest next step are reported.

## Environment

Jala variables are the only credential source:

- `ONESIGNAL_JALA_APP_ID` — required Jala App ID; public but exact.
- `ONESIGNAL_JALA_APP_API_KEY` — required Jala App API Key; never print it.
- `ONESIGNAL_JALA_ORG_API_KEY` — optional Jala Organization API Key; use only for `/apps` inventory.
- `ONESIGNAL_JALA_API_BASE_URL` — optional OneSignal API host; defaults to `https://api.onesignal.com`.

Every app-scoped command must map `ONESIGNAL_JALA_APP_ID` and `ONESIGNAL_JALA_APP_API_KEY` to the base `ONESIGNAL_*` names first. Every organization-scoped command must map `ONESIGNAL_JALA_ORG_API_KEY` to `ONESIGNAL_ORG_API_KEY`. Never map generic OneSignal credentials into themselves.

## Checks

- Confirm the base `onesignal` skill is available before operating; if missing, report the dependency and stop.
- Confirm the exact Jala App ID before every app-scoped request; never infer it from the API key or the word “Jala.”
- Keep Jala App and Organization API Keys separate and redacted.
- Confirm the exact app, audience, scope, and action immediately before every Jala send or state-changing write. Require destructive confirmation before cancellation or deletion.
- Use current Users and Subscriptions APIs, not legacy Player/device endpoints.
- Report Jala message IDs, user/subscription identifiers, status, counts, and observed delivery state without exposing secrets or unnecessary PII.
