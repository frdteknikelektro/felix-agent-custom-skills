# Email Templates

Required permission: `read` for inspection; `write` for creating, updating, replacing, publishing, or deleting template state. Every template mutation requires explicit confirmation of the exact template target, replacement scope, and action immediately before execution.

## Template resources

- `GET /v3/REST/template` — list templates.
- `POST /v3/REST/template` — create a template configuration.
- `GET /v3/REST/template/{template_ID}` — inspect template configuration.
- `PUT /v3/REST/template/{template_ID}` — update template configuration.
- `DELETE /v3/REST/template/{template_ID}` — delete a template.
- `GET /v3/REST/template/{template_ID}/detailcontent` — retrieve template content.
- `POST /v3/REST/template/{template_ID}/detailcontent` — create or replace template content.
- `PUT /v3/REST/template/{template_ID}/detailcontent` — update template content while preserving unspecified fields.

Mailjet’s template API separates configuration from content. The official guide warns that `POST /detailcontent` resets unspecified content fields to `null`; use `PUT` when changing only part of existing content.

## Workflow

1. Resolve the exact template ID, configuration/content operation, content fields, and publication state.
   Completion: one template target and operation are concrete.
2. Read the current configuration and content before an update or replacement. Select `PUT` when preserving unspecified content fields matters.
   Completion: the current state and intended replacement scope are known.
3. For a create, update, replacement, publication, or delete, obtain explicit confirmation immediately before the request.
   Completion: confirmation names the exact template and mutation, or the operation is paused.
4. Read the template back and report configuration, content state, and publication status.
   Completion: the observed post-write state or precise API failure is reported.

Template content may be used by future sends. Keep credentials, secrets, and unnecessary recipient data out of template bodies and variables.

Official references: [Templates](https://dev.mailjet.com/email/reference/templates/) and [Template API guide](https://dev.mailjet.com/email/guides/template-api/).
