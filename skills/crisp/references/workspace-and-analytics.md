# Crisp workspace operations and analytics

Read this branch for operators, availability, inboxes, website settings, campaigns, and analytics. Keep `website_id` explicit for every route.

## Operators and availability

Common read routes:

```text
GET /v1/website/{website_id}/operators/list
GET /v1/website/{website_id}/operators/active
GET /v1/website/{website_id}/availability/status
GET /v1/website/{website_id}/availability/operators
```

Operator membership routes can invite an operator, change membership, or unlink an operator. Resolve the exact operator identifier and website before any mutation. Unlinking membership is a destructive access change and requires destructive confirmation.

## Inboxes

List and inspect inboxes:

```text
GET  /v1/website/{website_id}/inboxes/list/{page_number}
HEAD /v1/website/{website_id}/inbox/{inbox_id}
GET  /v1/website/{website_id}/inbox/{inbox_id}
```

Create, replace, update, or delete an inbox with the documented routes:

```text
POST   /v1/website/{website_id}/inbox
PUT    /v1/website/{website_id}/inbox/{inbox_id}
PATCH  /v1/website/{website_id}/inbox/{inbox_id}
DELETE /v1/website/{website_id}/inbox/{inbox_id}
```

Creating or changing an inbox requires confirmation naming the exact website, inbox target, and requested configuration. Deleting an inbox requires destructive confirmation.

## Website settings

```text
GET   /v1/website/{website_id}/settings
PATCH /v1/website/{website_id}/settings
```

Read current settings before a patch, describe the exact fields being changed, and re-read after a successful update. Do not copy a full settings object back when the user asked for a narrow change.

## Campaigns

List campaigns and their recipients/statistics:

```text
GET /v1/website/{website_id}/campaigns/list/{page_number}
GET /v1/website/{website_id}/campaign/{campaign_id}/recipients/{page_number}
GET /v1/website/{website_id}/campaign/{campaign_id}/statistics/{type}/{page_number}
```

Campaign lifecycle routes include:

```text
POST /v1/website/{website_id}/campaign/{campaign_id}/dispatch
POST /v1/website/{website_id}/campaign/{campaign_id}/test
POST /v1/website/{website_id}/campaign/{campaign_id}/pause
POST /v1/website/{website_id}/campaign/{campaign_id}/resume
```

Treat `dispatch` and `test` as sends: confirm the exact campaign, workspace, recipient scope, and whether the action is live or test. Treat pause/resume as state-changing writes that require confirmation. Use the current official reference for campaign creation/template payloads and supported statuses.

## Analytics

Generate analytics with:

```text
POST /v1/website/{website_id}/analytics/generate
```

The body selects the metric, result type, split, and date/range options. Do not invent metric names or date schemas; read the current official route schema before generating a report. Report the requested range and whether the result is a generated aggregate or a raw conversation/profile export.

## Official source

Use the [Crisp REST API workspace, campaign, and analytics reference](https://docs.crisp.chat/references/rest-api/v1/) for current operator scopes, inbox fields, settings schemas, campaign statuses, analytics metrics, and response codes.

Completion: the exact workspace/resource, route, read-before-write requirement, permission, confirmation, and verification plan are resolved.
