---
name: mailgun-jala
description: Jala Mailgun email delivery and sending-domain operations through the REST API. Use for Jala email or MIME sends, domains, suppressions, routes, webhooks, templates, delivery logs, or metrics.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: mailgun jala, jala mailgun, Jala email, Jala sending domain, Jala suppression, Jala bounce, Jala route, Jala webhook, Jala template, Jala delivery logs, Jala metrics
env:
  - key: MAILGUN_JALA_API_KEY
    description: Jala Mailgun private API key, or a domain sending key for Jala message submission.
    secret: true
    required: true
  - key: MAILGUN_JALA_API_BASE_URL
    description: Jala Mailgun API host; select the US or EU host for the confirmed Jala domain.
    default: https://api.mailgun.net
  - key: MAILGUN_JALA_DOMAIN
    description: Confirmed Jala sending or domain-scoped Mailgun domain.
---

# Mailgun Jala

## Purpose

Route Jala Mailgun work through the base [`mailgun`](../mailgun/SKILL.md) skill with Jala-only credentials and domain/region context.

## When to use

Use when the request names Jala Mailgun, Jala email, a Jala sending domain, or Jala delivery data. Deploy this overlay together with the base `mailgun` skill.

## Out of scope

- Recreating Mailgun endpoint recipes or API schemas; use the base skill’s branch references.
- Guessing a canonical Jala Mailgun domain; this repository does not define one.
- Using generic `MAILGUN_*` values as the source credential.

## Use Cases

- **Send from Jala Mailgun** — resolve the exact Jala domain, sender, recipients, content, and region, then follow the base sending branch.
- **Inspect Jala delivery** — resolve the Jala domain and region, then follow the base analytics branch.
- **Manage Jala configuration** — resolve the exact domain or resource, then follow the matching base branch and write gate.

## Permissions

Use the base skill’s local `read`, `send`, and `write` permissions. Felix evaluates grants under `mailgun-jala:` for this overlay. The base skill’s explicit confirmation rule applies to every Jala update, rename, copy to an existing destination, import, or deletion that can overwrite or remove existing state.

## Workflow

1. **Authorize.** Resolve the operation against this skill’s local permission using Felix’s server-computed `permissions_per_skill` row. If it is under `need=[...]`, emit one `PERMISSION_REQUIRED` block with skill `mailgun-jala` and stop.
   Completion: the operation permission is authorized, or the complete permission request is emitted.
2. **Map credentials.** Before any Mailgun API call, map only the Jala variables:

   ```bash
   export MAILGUN_API_KEY="$MAILGUN_JALA_API_KEY"
   export MAILGUN_API_BASE_URL="${MAILGUN_JALA_API_BASE_URL:-https://api.mailgun.net}"
   export MAILGUN_DOMAIN="${MAILGUN_JALA_DOMAIN:-}"
   ```

   Keep the Jala key secret; never source a credential file or use generic Mailgun variables as the source.
   Completion: mapped variables are present without exposing their values.
3. **Resolve Jala context.** Use `MAILGUN_JALA_DOMAIN` when set; otherwise use the exact domain supplied by the user. Require one for sending and domain-scoped work. Match the configured host to the domain’s US/EU region.
   Completion: one confirmed Jala domain and region are resolved, or one focused clarification is required.
4. **Delegate.** For account-wide work, validate the mapped private key with harmless `GET /v4/domains?limit=1`. For sending with a domain sending key, proceed directly to the base sending preflight. Then read and follow [`mailgun/SKILL.md`](../mailgun/SKILL.md) and its selected branch reference.
   Completion: the Jala credential context is validated and the base branch is selected.
5. **Execute and report.** Run the base workflow with the mapped Jala variables and preserve its recipient, confirmation, verification, redaction, and accepted-versus-delivered rules.
   Completion: the requested Jala state is observed and reported, or the redacted API failure and smallest next step are reported.

## Environment

Jala variables are the only credential source:

- `MAILGUN_JALA_API_KEY` — required Jala private API key or domain sending key; never print it.
- `MAILGUN_JALA_API_BASE_URL` — optional US/EU API host; defaults to `https://api.mailgun.net`.
- `MAILGUN_JALA_DOMAIN` — optional default domain; required when the request is domain-scoped or sends a message.

Every command must map `MAILGUN_JALA_*` to the base `MAILGUN_*` names first. Never map the generic `MAILGUN_API_KEY` into itself.

## Checks

- Confirm the base `mailgun` skill is available before operating; if missing, report the dependency and stop.
- Read the official Mailgun link in the selected base reference when endpoint behavior or request schema may have changed.
- Include the Jala domain, region, returned identifier, and observed state when relevant.
- Confirm the exact existing-state target immediately before any update, rename, copy to an existing destination, import, or deletion.
- Redact API keys, mapped credentials, webhook secrets, recipient data, and message bodies.
