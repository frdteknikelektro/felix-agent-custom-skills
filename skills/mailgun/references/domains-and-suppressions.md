# Domains and Suppressions

Required permission: `read` for inspection; `write` for create, update, import, or delete operations. Updates, imports, and deletions that can overwrite or remove existing state require explicit confirmation of the exact target immediately before execution.

## Domains

Use the Domains API:

- `GET /v4/domains` — list domains; use `limit` and pagination as exposed by the response.
- `POST /v4/domains` — create a domain.
- `GET /v4/domains/{domain_name}` — inspect one domain and its DNS records.
- `PUT /v4/domains/{domain_name}` — update domain settings.
- `PUT /v4/domains/{domain_name}/verify` — request DNS verification.
- `DELETE /v3/domains/{domain_name}` — delete a domain only after explicit confirmation of the exact domain.

Domain creation and verification may return DNS records that must be added outside Mailgun. Report those records clearly, but do not attempt registrar changes through this skill.

Confirm the exact domain before a write. For domain updates or deletes, obtain explicit confirmation immediately before execution. Domain metadata is account-wide; message, event, suppression, route, and tracking data remain region-bound. Use the region host associated with the target domain.

## Suppressions

Mailgun stores unsubscribes, bounces, and complaints per domain. Use the domain-specific suppression endpoints and the address encoded for the URL:

- `GET /v3/{domain_name}/unsubscribes`
- `GET /v3/{domain_name}/unsubscribes/{address}`
- `POST /v3/{domain_name}/unsubscribes`
- `DELETE /v3/{domain_name}/unsubscribes/{address}`
- `GET /v3/{domain_name}/bounces` — list bounces.
- `GET /v3/{domain_name}/bounces/{address}` — inspect one bounce; URL-encode the address.
- `POST /v3/{domain_name}/bounces` — add one bounce or a JSON array of bounce records; use the exact body schema in the official reference.
- `POST /v3/{domain_name}/bounces/import` — import a CSV file of bounce records.
- `DELETE /v3/{domain_name}/bounces/{address}` — remove one bounce after explicit confirmation.
- `DELETE /v3/{domain_name}/bounces` — clear all bounces only after explicit confirmation of the complete target set.
- `GET /v3/{domain_name}/complaints` — list complaints.
- `GET /v3/{domain_name}/complaints/{address}` — inspect one complaint; URL-encode the address.
- `POST /v3/{domain_name}/complaints` — add one complaint or a JSON array of complaint records; use the exact body schema in the official reference.
- `POST /v3/{domain_name}/complaints/import` — import a CSV file of complaint records.
- `DELETE /v3/{domain_name}/complaints/{address}` — remove one complaint after explicit confirmation.
- `DELETE /v3/{domain_name}/complaints` — clear all complaints only after explicit confirmation of the complete target set.

Some official Mailgun page URLs use a legacy domain identifier in the slug; this skill consistently writes the request placeholder as `{domain_name}`. For add/import operations, use the exact request schema from the official [Bounces](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/bounces/post-v3--domainid--bounces) and [Complaints](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/complaints) references before writing.

For `POST /bounces`, send one record as form data or a JSON array (up to 1,000 records); bounce records use `address`, `code`, `error`, and optional `created_at`. For `POST /complaints`, use the documented complaint record fields, including `address` and optional `created_at`. Use multipart upload for the `/import` endpoints and report `202` as processing rather than complete.

## Suppression workflow

1. Resolve the exact domain, resource (`unsubscribe`, `bounce`, or `complaint`), address or import file, region, and requested mutation.
   Completion: the target set and operation are concrete; a bulk target is enumerated.
2. For an add, validate the address and required resource fields against the linked official schema. For an import, confirm the source file and row scope; if it can replace existing records, obtain explicit confirmation of the target set.
   Completion: the request body or source file is validated without exposing unrelated recipient data, and any overwrite target is confirmed.
3. For a remove or clear operation, obtain explicit confirmation immediately before the DELETE call.
   Completion: confirmation names the exact address or complete target set, or the operation is paused.
4. Read the resource back when the endpoint exposes it and report the observed count or masked address state.
   Completion: the post-write state or the precise API failure is reported.

## Output

For domain inspection, report domain name, state, region-relevant DNS records, and verification status. For suppression queries, report counts and masked addresses when full addresses are not needed. Never print API keys or unrelated recipient data.

Official references: [Domains](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/domains), [Bounces](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/bounces/post-v3--domainid--bounces), [Complaints](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/complaints), and [API overview](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview).
