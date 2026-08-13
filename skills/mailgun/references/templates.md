# Stored Templates

Required permission: `read` for inspection; `write` for create, update, copy, rename, or delete operations. Updates, renames, copies to existing destinations, and deletions that can overwrite or remove existing state require explicit confirmation of the exact target immediately before execution.

Mailgun stores reusable templates and versions under a sending domain. Use the v3 Domain Templates API:

- `GET /v3/{domain_name}/templates` — list templates.
- `POST /v3/{domain_name}/templates` — create a template.
- `GET /v3/{domain_name}/templates/{template_name}` — inspect one template; add `active=yes` when the active version content is needed.
- `PUT /v3/{domain_name}/templates/{template_name}` — update a template, including its description.
- `PUT /v3/{domain_name}/templates/{template_name}/rename/{new_template_name}` — rename a template; this is a separate endpoint from update.
- `PUT /v3/{domain_name}/templates/{template_name}/copy` — copy a template according to the official request schema.
- `DELETE /v3/{domain_name}/templates/{template_name}` — delete one template after explicit confirmation.
- `GET /v3/{domain_name}/templates/{template_name}/versions` — list versions.
- `POST /v3/{domain_name}/templates/{template_name}/versions` — create a version.
- `PUT /v3/{domain_name}/templates/{template_name}/versions/{version_name}/copy/{new_version_name}` — copy a version.
- `DELETE /v3/{domain_name}/templates/{template_name}/versions/{version_name}` — delete one version after explicit confirmation.

## Workflow

1. Resolve the exact domain, template name, new name when renaming, version/tag, mutation, and region.
   Completion: one template target and one operation are concrete.
2. Use `read` for inspection or `write` for a mutation. A template mutation affects future sends but does not resend existing messages.
   Completion: the operation is authorized and its target is known.
3. Use multipart fields for template creation/version creation, including the template body and requested active/tag state. Use the dedicated rename path for renames; do not send a rename through the ordinary update path.
   Completion: the request method, path, and body match the selected official operation.
4. For an update, rename, copy to an existing destination, or delete, obtain explicit confirmation immediately before the request.
   Completion: confirmation names the exact existing template or version target, destination, or new name, or the operation is paused.
5. Read the template or version back after a mutation when the endpoint exposes it. Report the returned name, version/tag, active state, and domain.
   Completion: the post-write state or precise API failure is reported.

Keep template bodies and variables free of credentials and unnecessary recipient data. When a message supplies a `From` or `Subject`, those message-level headers override template headers.

Official references: [Domain Templates](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/domain-templates) and [Rename a template](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/domain-templates/put-v3--domain-name--templates--template-name--rename--new-template-name-).
