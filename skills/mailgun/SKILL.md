---
name: mailgun
description: Mailgun email delivery and sending-domain operations through the REST API. Use for sending email or MIME messages; managing domains, DNS verification, suppressions, routes, webhooks, and templates; or querying delivery logs and metrics.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: mailgun, Mailgun API, send through Mailgun, sending domain, Mailgun suppression, Mailgun route, Mailgun webhook, Mailgun template, Mailgun delivery logs, Mailgun metrics
env:
  - key: MAILGUN_API_KEY
    description: Mailgun private API key, or a domain sending key for message submission.
    secret: true
    required: true
  - key: MAILGUN_API_BASE_URL
    description: Mailgun API host; select the US or EU host for the target domain.
    default: https://api.mailgun.net
  - key: MAILGUN_DOMAIN
    description: Confirmed default sending or domain-scoped Mailgun domain.
---

# Mailgun

## Purpose

Operate Mailgun through `curl` and the REST API while preserving recipient, domain, region, credential, and post-write verification boundaries.

## When to use

Use for Mailgun email or MIME sends, domain and DNS-status work, suppressions, routes, webhooks, stored templates, delivery logs, events, metrics, or stored-message inspection.

## Out of scope

- Registrar or DNS-provider changes outside Mailgun; report the required records instead.
- SMTP delivery; use the Mailgun REST API branches in this skill.
- Guessing a sending domain, region, recipient, sender, or message content.

## Use Cases

- **Send email** — resolve the exact domain, sender, recipients, content, and region, then load [sending](references/sending.md).
- **Manage a domain or suppression** — resolve the exact target and load [domains-and-suppressions](references/domains-and-suppressions.md).
- **Manage inbound delivery** — load [routes-and-webhooks](references/routes-and-webhooks.md) for routes or webhooks.
- **Manage stored content** — load [templates](references/templates.md) for templates and versions.
- **Investigate delivery** — load [analytics](references/analytics.md) for Logs, Metrics, Events, or stored messages.

## Permissions

Permissions are skill-local; Felix adds the `mailgun:` namespace when it evaluates grants.

- `read` — inspect or query domains, DNS status, suppressions, routes, webhooks, templates, stored messages, logs, events, or metrics.
- `send` — submit an email or MIME message for delivery.
- `write` — create, update, import, or delete Mailgun configuration or suppression data.

Use `send` for a message submission even though the API uses `POST`. Use `write` for configuration and suppression mutations. Any update, rename, copy to an existing destination, import, or deletion that can overwrite or remove existing state requires explicit confirmation naming the exact target immediately before execution. For unclear intent, use `write` unless the request is strictly read-only.

## Workflow

1. **Authorize.** Read the server-computed `permissions_per_skill` row for `mailgun`; treat `have=[...]` as authoritative. Map the request to the narrowest permission above. If it is under `need=[...]`, emit exactly one `PERMISSION_REQUIRED` block using Felix’s output contract and stop.
   Completion: the required permission is authorized, or the complete permission request is emitted.
2. **Resolve the target.** Determine the exact operation, domain, region, recipients, sender, and content from the request and environment. Require a confirmed domain for sending and domain-scoped work; ask one focused question when a missing value changes the safe target.
   Completion: one concrete target and region are resolved.
3. **Load the branch.** Read the matching reference: [sending](references/sending.md), [domains-and-suppressions](references/domains-and-suppressions.md), [routes-and-webhooks](references/routes-and-webhooks.md), [templates](references/templates.md), [analytics](references/analytics.md), or [quick-examples](references/quick-examples.md). The branch’s official Mailgun link is the source to recheck when an endpoint schema may have changed.
   Completion: the reference for the requested branch and its official source are loaded.
4. **Preflight credentials.** Confirm `MAILGUN_API_KEY` is present without displaying it. Account-wide operations need a private account key; sending may use a domain sending key. After authorization, validate an account key with harmless `GET /v4/domains?limit=1`; skip that account check for a send using a domain sending key.
   Completion: the key type is suitable for the operation, or the redacted API error is reported.
5. **Execute.** Run the documented method against `MAILGUN_API_BASE_URL` with Basic Auth. For sends, verify `from`, at least one exact recipient, subject, and one of `text`, `html`, `amp-html`, or `template`. For writes, name the exact target; before an update, rename, copy to an existing destination, import, or deletion that can overwrite or remove existing state, obtain explicit confirmation immediately before the call.
   Completion: Mailgun returns a structurally valid 2xx response, or the failure is captured.
6. **Verify and report.** Re-read a mutated object when the API exposes a read endpoint. Report the returned ID, state, counts, or message; treat send acceptance as queued/accepted rather than delivered, and `202` import responses as processing rather than complete.
   Completion: the user receives confirmed API facts, the requested interpretation, and any remaining uncertainty.

## Environment

Felix injects the declared variables before the turn. Read them directly; keep `MAILGUN_API_KEY` in the process environment and out of replies, files, URLs, and logs.

- US: `https://api.mailgun.net`
- EU: `https://api.eu.mailgun.net`

Set `MAILGUN_API_BASE_URL` to the selected host. Keep `MAILGUN_DOMAIN` empty for account-wide domain operations and require it for sending or domain-scoped work. Do not infer a domain or switch regions after an error.

Common request shape:

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -H "Accept: application/json" \
  "$MAILGUN_API_BASE_URL/v4/domains"
```

Use multipart `-F` fields for `/messages`, form encoding where a reference specifies it, JSON only for endpoints that require JSON, and URL-encode query values and address path segments.

## Checks

- Keep the API key secret; redact authorization, query values containing recipient data, webhook secrets, and message bodies from output.
- Require an exact sender, recipient scope, and content for every send. Test mode still needs an exact recipient and `send` permission.
- Before an update, rename, copy to an existing destination, import, or delete, confirm the exact domain, route, webhook, template, suppression record, or queued-message target immediately before execution when existing state can be overwritten or removed.
- Prefer current Logs and Metrics APIs. Use legacy Events or Stats only when requested or required by an existing workflow, and label them deprecated.
- When saving a response or stored message as a file, apply Felix’s Workspace placement contract and attach only the requested artifact.
- Report API method, redacted path, status, and error detail on failure; never claim a state that was not observed.

Route Mailgun work through this skill instead of embedding Mailgun credentials or API calls in another skill.
