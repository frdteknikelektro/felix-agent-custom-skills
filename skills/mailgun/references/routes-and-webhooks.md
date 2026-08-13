# Routes and Webhooks

Required permission: `read` for inspection; `write` for create, update, or delete operations. Updates and deletions that can overwrite or remove existing state require explicit confirmation of the exact route or webhook immediately before execution.

## Routes

Routes process inbound messages that match an expression. A route can forward to an HTTP endpoint or email address, or store the message temporarily. Treat route changes as production-impacting configuration.

Typical endpoints:

- `GET /v3/routes` — list routes.
- `POST /v3/routes` — create a route with a priority, expression, and actions.
- `GET /v3/routes/{id}` — inspect a route.
- `PUT /v3/routes/{id}` — update a route.
- `DELETE /v3/routes/{id}` — delete only after explicit confirmation of the exact route ID.

Route mutations use form-encoded fields such as `priority`, `description`, `expression`, and repeated `action` values. Smaller priority numbers run first. Read the route back after a mutation.

Before creating or updating, confirm the exact expression, action destination, priority, and whether the route should stop further processing. For an update or delete, obtain explicit confirmation immediately before execution. Do not send inbound message content to an unconfirmed destination.

## Webhooks

Use the domain webhooks API:

- `GET /v3/domains/{domain_name}/webhooks`
- `POST /v3/domains/{domain_name}/webhooks`
- `GET /v3/domains/{domain_name}/webhooks/{webhook_name}`
- `PUT /v3/domains/{domain_name}/webhooks/{webhook_name}`
- `DELETE /v3/domains/{domain_name}/webhooks/{webhook_name}`

Mailgun also exposes newer v4 webhook operations. Read the current endpoint schema before using v4. Confirm the domain, event type, URL, and signing/security expectations before mutation; for an update or delete, obtain explicit confirmation immediately before execution. Keep webhook signing secrets out of output.

## Verification

After a route or webhook mutation, read the exact object back and report its ID/name, event or expression, destination in redacted form, and enabled state. If the API cannot read it back, report only the successful mutation response and say that post-write verification was unavailable.

Official references: [Routes](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/routes) and [Domain webhooks](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/webhooks/post-v3-domains--domain--webhooks).
