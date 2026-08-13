---
name: mailjet
description: Mailjet transactional email and account operations through the REST API. Use for sending messages; managing contacts, contact lists, senders, templates, event callbacks, message history, or delivery statistics.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: mailjet, Mailjet API, send through Mailjet, Mailjet contact, Mailjet contact list, Mailjet sender, Mailjet template, Mailjet event callback, Mailjet message history, Mailjet statistics
env:
  - key: MAILJET_API_KEY
    description: Mailjet API key used as the Basic Auth username.
    secret: true
    required: true
  - key: MAILJET_SECRET_KEY
    description: Mailjet Secret Key used as the Basic Auth password.
    secret: true
    required: true
  - key: MAILJET_API_BASE_URL
    description: Mailjet API host.
    default: https://api.mailjet.com
---

# Mailjet

## Purpose

Operate Mailjet through its REST API while preserving recipient, sender, credential, confirmation, and post-write verification boundaries.

## When to use

Use for Mailjet transactional sends, contacts, contact lists, sender validation, templates, event callbacks, message history, or delivery statistics.

## Out of scope

- SMTP relay configuration; use Mailjet’s REST API branches here for API operations.
- Designing or scheduling marketing campaigns; use Mailjet campaign tooling when the request is campaign-specific.
- Guessing a sender, recipient, contact list, template, message ID, or callback URL.

## Use Cases

- **Send transactional email** — resolve the exact validated sender, recipients, content or template, then load [sending](references/sending.md).
- **Manage contacts and lists** — resolve the exact contact, list, subscription action, or import scope, then load [contacts-and-lists](references/contacts-and-lists.md).
- **Manage sending identity** — inspect senders or DNS records, register a sender, or request validation with [senders](references/senders.md).
- **Manage reusable content** — inspect or update template configuration and content with [templates](references/templates.md).
- **Investigate delivery** — use [events-and-statistics](references/events-and-statistics.md) for message history, event callbacks, or statcounters.

## Permissions

Permissions are skill-local; Felix adds the `mailjet:` namespace when it evaluates grants.

- `read` — inspect senders, DNS records, contacts, lists, templates, messages, event callbacks, or statistics.
- `send` — submit transactional messages through Send API v3.1.
- `write` — create, update, validate, import, subscribe, unsubscribe, or delete Mailjet resources.

Use `send` for message submission even though the API uses `POST`. Use `write` for account and contact-management mutations. Every send and every write that creates, updates, validates, imports, subscribes, unsubscribes, changes callback configuration, or deletes Mailjet state requires explicit confirmation naming the exact target, scope, and action immediately before execution. For unclear intent, use `write` unless the request is strictly read-only.

## Workflow

1. **Authorize.** Read the server-computed `permissions_per_skill` row for `mailjet`; treat `have=[...]` as authoritative. Map the request to the narrowest permission above. If it is under `need=[...]`, emit exactly one `PERMISSION_REQUIRED` block using Felix’s output contract and stop.
   Completion: the required permission is authorized, or the complete permission request is emitted.
2. **Resolve the target.** Determine the exact operation, validated sender, recipients, message content or template, contact/list IDs, message ID, callback URL, and statistics filters from the request and environment.
   Completion: one concrete target and operation are resolved.
3. **Load the branch.** Read the matching reference: [sending](references/sending.md), [contacts-and-lists](references/contacts-and-lists.md), [senders](references/senders.md), [templates](references/templates.md), [events-and-statistics](references/events-and-statistics.md), or [quick-examples](references/quick-examples.md). Recheck the linked official Mailjet page when a request schema may have changed.
   Completion: the branch reference and its official source are loaded.
4. **Preflight credentials.** Confirm both `MAILJET_API_KEY` and `MAILJET_SECRET_KEY` are present without displaying them. Use Basic Auth with the API key as username and Secret Key as password. For account reads or writes, a harmless `GET /v3/REST/sender?Limit=1` may validate credentials after authorization; do not run an extra read preflight when the request only needs `send`.
   Completion: both secrets are present and suitable for the operation, or the redacted API error is reported.
5. **Execute.** Run the documented method against `MAILJET_API_BASE_URL`. For Send API v3.1, validate a non-empty `Messages` array, the exact `From` and recipient objects, and either content fields or a template before submission. Name the exact target and scope; before every send or write that creates, updates, validates, imports, subscribes, unsubscribes, changes callback configuration, or deletes Mailjet state, obtain explicit confirmation immediately before the call.
   Completion: Mailjet returns a structurally valid success response, a `JobID`, or the redacted failure is captured.
6. **Verify and report.** Re-read a mutated object when the API exposes a read endpoint. Poll a returned bulk-contact `JobID` until its state is observed. Report message IDs and UUIDs when present, but treat send acceptance as accepted/queued rather than delivered; use message history or statistics for delivery evidence.
   Completion: the user receives confirmed Mailjet facts, the requested interpretation, and any remaining uncertainty.

## Environment

Felix injects the declared variables before the turn. Use `MAILJET_API_KEY` as the Basic Auth username and `MAILJET_SECRET_KEY` as the password; keep both out of replies, files, URLs, and logs.

Mailjet’s REST API base URL is `https://api.mailjet.com`. Use `MAILJET_API_BASE_URL` only for an explicitly configured compatible host.

Common request shape:

```bash
curl --fail-with-body --silent --show-error \
  --user "$MAILJET_API_KEY:$MAILJET_SECRET_KEY" \
  -H "Accept: application/json" \
  "$MAILJET_API_BASE_URL/v3/REST/sender?Limit=1"
```

Use JSON bodies for the REST resources and Send API v3.1. URL-encode query values and path identifiers, and base64-encode attachment content as required by the sending reference.

## Checks

- Keep both credentials secret; redact Basic Auth, recipient addresses, message bodies, contact properties, callback secrets, and unnecessary PII.
- Require a registered and validated sender before sending. Do not infer a sender from the API key or recipient.
- For Send API v3.1, keep each request within Mailjet’s documented 50-message limit and use root-level `SandboxMode: true` only when the user explicitly requests a non-delivering validation.
- Before every send or state-changing write, confirm the exact target, scope, and action immediately before execution.
- Treat bulk contact operations as asynchronous when Mailjet returns a `JobID`; report processing separately from completion.
- Report method, redacted path, status, returned IDs, and precise API errors; never claim delivery from acceptance alone.

Route Mailjet work through this skill instead of embedding Mailjet credentials or API calls in another skill.
