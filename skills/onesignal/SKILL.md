---
name: onesignal
description: OneSignal messaging and user operations through the REST API. Use for sending push, email, or SMS messages; managing users, aliases, tags, and subscriptions; viewing message delivery data; or inspecting OneSignal apps.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: onesignal, OneSignal API, OneSignal notification, OneSignal push, OneSignal email, OneSignal SMS, OneSignal user, OneSignal subscription, OneSignal app, OneSignal message
env:
  - key: ONESIGNAL_APP_ID
    description: Exact OneSignal App ID for app-scoped requests. Public identifier, but required to select the data boundary.
    required: true
    secret: false
  - key: ONESIGNAL_APP_API_KEY
    description: OneSignal App API Key used with the Key authorization scheme for app-scoped requests.
    required: true
    secret: true
  - key: ONESIGNAL_ORG_API_KEY
    description: Optional OneSignal Organization API Key used only for organization-scoped app inventory requests.
    required: false
    secret: true
  - key: ONESIGNAL_API_BASE_URL
    description: OneSignal API host.
    default: https://api.onesignal.com
---

# OneSignal

## Purpose

Operate OneSignal through its REST API while preserving app boundaries, audience targeting, credential scope, confirmation, and delivery-verification rules.

## When to use

Use for OneSignal push, email, or SMS messages; users, aliases, tags, or subscriptions; message reports and history; or app inventory.

## Out of scope

- OneSignal SDK installation, client-side permission prompts, or mobile/web integration code.
- Dashboard-only campaign, Journey, template, segment, team, or organization administration not covered by the references here.
- API-key creation, rotation, deletion, or app creation/configuration; those require organization-level administration and dedicated runbooks.
- Guessing the App ID, user alias, subscription ID, segment, message ID, or credential scope.

## Use Cases

- **Send a message** — resolve the exact app, channel, audience, content, and schedule, then load [messaging](references/messaging.md).
- **Manage users and subscriptions** — resolve the exact alias, subscription, properties, or deletion target, then load [users-and-subscriptions](references/users-and-subscriptions.md).
- **Inspect delivery** — use [messages-and-delivery](references/messages-and-delivery.md) for message lists, outcomes, cancellation, or recipient history.
- **Export message data** — use [exports](references/exports.md) for paginated message reports, per-message CSV activity, retention limits, or Event Streams.
- **Inspect apps** — use [apps-and-auth](references/apps-and-auth.md) with the organization credential when the request is account-wide.
- **Use a safe recipe** — load [quick-examples](references/quick-examples.md) only after the app and operation are resolved.

## Permissions

Permissions are skill-local; Felix adds the `onesignal:` namespace when it evaluates grants.

- `read` — inspect app inventory, users, subscriptions, messages, outcomes, or message history.
- `send` — submit a OneSignal message through `POST /notifications`.
- `write` — create or update users, aliases, tags, subscriptions, or other app-scoped state documented by this skill.

Use `send` for message submission even though the API uses `POST`. Every send and every state-changing write requires explicit confirmation naming the exact App ID, audience or user target, scope, and action immediately before execution. Deletions and message cancellation require an explicit destructive confirmation. For unclear intent, use `write` unless the request is strictly read-only.

## Workflow

1. **Authorize.** Read the server-computed `permissions_per_skill` row for `onesignal`; treat `have=[...]` as authoritative. Map the request to the narrowest permission above. If it is under `need=[...]`, emit exactly one `PERMISSION_REQUIRED` block using Felix’s output contract and stop.
   Completion: the required permission is authorized, or the complete permission request is emitted.
2. **Resolve the app and target.** Resolve the exact `ONESIGNAL_APP_ID`, channel, user alias, subscription ID, segment/filter, message ID, or organization scope. The App ID is public but still must be exact; never infer it from a Jala name or credential.
   Completion: one concrete app boundary, operation, and target scope are resolved.
3. **Load the branch.** Read [messaging](references/messaging.md), [users-and-subscriptions](references/users-and-subscriptions.md), [messages-and-delivery](references/messages-and-delivery.md), [exports](references/exports.md), [apps-and-auth](references/apps-and-auth.md), or [quick-examples](references/quick-examples.md). Recheck the linked official OneSignal page when a schema or endpoint may have changed.
   Completion: the selected branch and its official source are loaded.
4. **Preflight credentials.** For app-scoped requests, confirm `ONESIGNAL_APP_API_KEY` and use `Authorization: Key ...` with `ONESIGNAL_APP_ID`. For organization-scoped `/apps` requests, confirm `ONESIGNAL_ORG_API_KEY`; do not substitute an App API Key. Keep both key types redacted.
   Completion: the correct credential scope is present without exposing its value, or the smallest blocker is reported.
5. **Validate and confirm.** For messages, choose exactly one targeting method, validate the channel-specific payload, and resolve the recipient scope. For user/subscription writes, resolve the exact alias or subscription target and requested mutation. Immediately before every send or write, obtain explicit confirmation naming the exact app, target, scope, and action.
   Completion: the payload and confirmation are complete, or execution is paused.
6. **Execute.** Run the documented method against `ONESIGNAL_API_BASE_URL` with JSON and the correct `Key` authorization header. Use a stable idempotency strategy when retrying message creation; do not blindly resend after a timeout.
   Completion: OneSignal returns the documented success status, message/user identifier, asynchronous acceptance, or a redacted failure.
7. **Verify and report.** Re-read a changed user when a view endpoint exists. For messages, save the returned message `id` when present and use View message or Message history for delivery evidence. Report accepted/queued separately from delivered, received, failed, canceled, or errored counts.
   Completion: the observed result, relevant identifiers, remaining uncertainty, and any redacted failure are reported.

## Environment

Felix injects the declared variables before the turn. Use `ONESIGNAL_APP_API_KEY` only as an app-scoped credential and `ONESIGNAL_ORG_API_KEY` only for organization-scoped app inventory. Never print, persist, place in URLs, or log either key.

OneSignal’s API host is `https://api.onesignal.com`. Use `ONESIGNAL_API_BASE_URL` only for an explicitly configured compatible host.

Common app-scoped request shape:

```bash
curl --fail-with-body --silent --show-error \
  -H "Authorization: Key $ONESIGNAL_APP_API_KEY" \
  -H "Content-Type: application/json" \
  "$ONESIGNAL_API_BASE_URL/apps/$ONESIGNAL_APP_ID/users/by/external_id/$ALIAS_ID"
```

Use URL encoding for alias IDs, query values, and other path data. Keep message bodies, user properties, email addresses, phone numbers, and push tokens out of replies unless necessary.

## Checks

- Use the exact App ID as the app data boundary; never invent a default app.
- Keep App API Keys and Organization API Keys separate and redacted. An App ID is public, but reporting it does not authorize using another app’s data.
- Before every send or state-changing write, confirm the exact app, target, scope, and action. Before cancellation or deletion, obtain destructive confirmation immediately before the call.
- For messages, use exactly one targeting method per request. Respect OneSignal’s documented 20,000-entry audience limits and 200-filter-entry limit; validate channel setup before sending.
- Prefer current Users and Subscriptions APIs over legacy Player/device endpoints.
- Treat a successful create-message response as accepted/created, not delivered. A response without an `id` may mean no valid subscriptions matched the target.
- Expect rate limits, `429`, and `5xx` responses. Retry only with a stable idempotency strategy and bounded backoff.
- Treat exported message and audience activity as sensitive data. Resolve the exact app, message/time scope, and destination before downloading or forwarding; keep export URLs redacted.
- Redact keys, aliases where sensitive, email addresses, phone numbers, push tokens, user properties, message contents, and callback/export URLs.

Route OneSignal work through this skill instead of embedding OneSignal credentials or API calls in another skill.
