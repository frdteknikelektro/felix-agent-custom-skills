---
name: mailjet-jala
description: Jala Mailjet transactional email and account operations through the REST API. Use for Jala Mailjet sends, contacts, contact lists, senders, templates, event callbacks, message history, or statistics.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: mailjet jala, jala mailjet, Jala Mailjet, Jala transactional email, Jala Mailjet contact, Jala Mailjet sender, Jala Mailjet template, Jala Mailjet delivery
env:
  - key: MAILJET_JALA_API_KEY
    description: Jala Mailjet API key used as the Basic Auth username.
    secret: true
    required: true
  - key: MAILJET_JALA_SECRET_KEY
    description: Jala Mailjet Secret Key used as the Basic Auth password.
    secret: true
    required: true
  - key: MAILJET_JALA_API_BASE_URL
    description: Jala Mailjet API host.
    default: https://api.mailjet.com
---

# Mailjet Jala

## Purpose

Route Jala Mailjet work through the base [`mailjet`](../mailjet/SKILL.md) skill with Jala-only credentials.

## When to use

Use when the request names Jala Mailjet, Jala transactional email, a Jala sender, or Jala Mailjet delivery data. Deploy this overlay together with the base `mailjet` skill.

## Out of scope

- Recreating Mailjet endpoint recipes or API schemas; use the base skill’s branch references.
- Defining or guessing a canonical Jala sender, contact list, template, message ID, or callback URL; this overlay does not define one, so require the exact supplied target.
- Using generic `MAILJET_*` values as the source credentials.

## Use Cases

- **Send Jala transactional email** — resolve an exact validated Jala sender, recipients, content or template, then follow the base sending branch.
- **Manage Jala contacts or lists** — resolve the exact target and action, then follow the base contacts branch.
- **Investigate Jala delivery** — resolve a Jala message ID or statistics filter, then follow the base events branch.

## Permissions

Use the base skill’s local `read`, `send`, and `write` permissions. Felix evaluates grants under `mailjet-jala:` for this overlay. The base skill’s confirmation rule applies to every Jala send and every state-changing write.

## Workflow

1. **Authorize.** Resolve the operation against this skill’s local permission using Felix’s server-computed `permissions_per_skill` row. If it is under `need=[...]`, emit one `PERMISSION_REQUIRED` block with skill `mailjet-jala` and stop.
   Completion: the operation permission is authorized, or the complete permission request is emitted.
2. **Map credentials.** Before any Mailjet API call, map only the Jala variables:

   ```bash
   export MAILJET_API_KEY="$MAILJET_JALA_API_KEY"
   export MAILJET_SECRET_KEY="$MAILJET_JALA_SECRET_KEY"
   export MAILJET_API_BASE_URL="${MAILJET_JALA_API_BASE_URL:-https://api.mailjet.com}"
   ```

   Keep both Jala secrets private; never source a credential file or use generic Mailjet variables as the source.
   Completion: mapped variables are present without exposing their values.
3. **Resolve Jala context.** Use the exact validated sender, recipient, contact/list, template, message, callback, or statistics target supplied by the user or environment. This repository defines no canonical Jala Mailjet sender or list.
   Completion: one concrete Jala target and operation are resolved, or one focused clarification is required.
4. **Delegate.** For account reads or writes, a harmless `GET /v3/REST/sender?Limit=1` may validate the mapped credentials after authorization. Then read and follow [`mailjet/SKILL.md`](../mailjet/SKILL.md) and its selected branch reference. Do not run an extra read preflight for a send-only request.
   Completion: the Jala credential context is ready and the base branch is selected.
5. **Execute and report.** Run the base workflow with the mapped Jala variables and preserve its recipient, validated-sender, confirmation, verification, redaction, asynchronous-job, and accepted-versus-delivered rules.
   Completion: the requested Jala state is observed and reported, or the redacted API failure and smallest next step are reported.

## Environment

Jala variables are the only credential source:

- `MAILJET_JALA_API_KEY` — required Jala API key; never print it.
- `MAILJET_JALA_SECRET_KEY` — required Jala Secret Key; never print it.
- `MAILJET_JALA_API_BASE_URL` — optional Mailjet API host; defaults to `https://api.mailjet.com`.

Every command must map `MAILJET_JALA_*` to the base `MAILJET_*` names first. Never map generic Mailjet credentials into themselves.

## Checks

- Confirm the base `mailjet` skill is available before operating; if missing, report the dependency and stop.
- Recheck the official Mailjet link in the selected base reference when endpoint behavior or request schema may have changed.
- Confirm the exact validated Jala sender before sending; never infer it from the API key.
- Confirm the exact target, scope, and action immediately before every Jala send or state-changing write.
- Include Jala identifiers, sender/list/template/message target, returned job state, and observed delivery state when relevant.
- Redact API keys, mapped credentials, recipient data, contact properties, callback secrets, and message bodies.
