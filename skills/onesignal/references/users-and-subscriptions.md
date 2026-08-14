# Users and Subscriptions

Required permission: `read` for inspection; `write` for creating, updating, aliasing, or deleting users and subscriptions. Every mutation requires explicit confirmation naming the exact App ID, alias/subscription target, scope, and action immediately before execution.

OneSignal’s current model has Users with one or more channel Subscriptions. Prefer `external_id` as the stable user alias. Do not use legacy Player/device endpoints for new work.

## User resources

- `POST /apps/{app_id}/users` — create or upsert a user with `identity`, optional `properties`, and optional `subscriptions`.
- `GET /apps/{app_id}/users/by/{alias_label}/{alias_id}` — view a user, aliases, properties, and subscriptions.
- `PATCH /apps/{app_id}/users/by/{alias_label}/{alias_id}` — update user properties or tags; use `properties.tags` for tag changes.
- `PATCH /apps/{app_id}/users/by/{alias_label}/{alias_id}/identity` — create or update aliases when an existing alias identifies the user.
- `DELETE /apps/{app_id}/users/by/{alias_label}/{alias_id}` — permanently delete the user, aliases, properties, and all subscriptions; asynchronous `202` response.

Use a known alias in every path. If the request does not supply an alias, resolve it through the user’s own system or ask for the smallest missing identifier; never guess.

## Subscription resources

- `POST /apps/{app_id}/users/by/{alias_label}/{alias_id}/subscriptions` — attach a Subscription to an existing user by alias.
- `DELETE /apps/{app_id}/subscriptions/{subscription_id}` — permanently delete one Subscription; asynchronous `202` response.

Subscription types include mobile push, web push, email, and SMS. For push subscriptions created by an SDK, prefer the SDK lifecycle; use the API for the documented server-side create/import workflows and explicit user requests.

## Workflow

1. Resolve the exact App ID, alias label/value, subscription ID, channel, and requested properties or action.
   Completion: one concrete target and mutation or read are resolved.
2. Read the current user or subscription context before a mutation. Confirm that aliases, tags, tokens, and channel scope refer to the intended user.
   Completion: the current target state and replacement scope are observed without exposing unnecessary PII.
3. For a create, update, alias change, subscription change, or delete, obtain explicit confirmation immediately before the request. For user or subscription deletion, call out irreversibility and the full deletion scope.
   Completion: confirmation names the exact app, target, scope, and action, or the operation is paused.
4. Read the user back after a successful update when possible. For asynchronous deletion, report the accepted `202` and do not claim completion until a documented follow-up confirms it.
   Completion: the observed state, asynchronous status, or precise API failure is reported.

Keep email addresses, phone numbers, push tokens, tags, and user properties redacted unless required for the user’s decision.

Official references: [Create user](https://documentation.onesignal.com/reference/create-user), [View user](https://documentation.onesignal.com/reference/view-user), [Update user](https://documentation.onesignal.com/reference/update-user), [Delete user](https://documentation.onesignal.com/reference/delete-user), [Create subscription](https://documentation.onesignal.com/reference/create-subscription), and [Delete subscription](https://documentation.onesignal.com/reference/delete-subscription).
