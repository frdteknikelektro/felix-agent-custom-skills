# Apps and Authentication Scope

Required permission: `read` for app inventory. App inventory uses an Organization API Key, not the App API Key used for messages and users.

## App inventory

- `GET /apps` with `Authorization: Key $ONESIGNAL_ORG_API_KEY` — list apps associated with the organization, including App ID, name, subscription counts, messageable counts, timestamps, and organization ID.
- `GET /apps/{app_id}` with the organization credential — inspect one app’s metadata and platform configuration.

The `/apps` list is limited to 1,000 apps. Resolve the organization scope and exact App ID before reporting or using an app. App IDs are public identifiers, but they still select the data boundary for all app-scoped operations.

## Credential rules

- **App API Key** — use with `Authorization: Key $ONESIGNAL_APP_API_KEY` for app-scoped messages, users, subscriptions, and message reports.
- **Organization API Key** — use with `Authorization: Key $ONESIGNAL_ORG_API_KEY` for organization-scoped app inventory.
- Never substitute one key type for the other and never print either key.

API-key creation, rotation, deletion, app creation, app updates, team administration, and organization administration are outside this skill. Route them to a dedicated OneSignal administration workflow after resolving the required organization authority.

## Workflow

1. Resolve whether the request is app-scoped or organization-scoped and identify the exact App ID or organization target.
   Completion: the credential scope and target boundary are concrete.
2. Use the matching key type and a read-only `GET` request. Report app IDs, names, counts, and timestamps; omit platform credentials and keys.
   Completion: the requested inventory is directly observed or the redacted authorization failure is reported.

Official references: [View apps](https://documentation.onesignal.com/reference/view-apps), [View an app](https://documentation.onesignal.com/reference/view-an-app), [Quick start API guide](https://documentation.onesignal.com/reference/quick-start-api-guide), and [REST API overview](https://documentation.onesignal.com/reference/rest-api-overview).
