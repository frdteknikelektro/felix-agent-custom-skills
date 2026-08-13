# Senders and DNS

Required permission: `read` for inspection; `write` for creating, updating, validating, checking, or deleting a sender or DNS-check state. Every sender or DNS mutation and validation action requires explicit confirmation of the exact target and action immediately before execution.

## Sender resources

- `GET /v3/REST/sender` — list sender email addresses and domains.
- `POST /v3/REST/sender` — register a sender email address or domain.
- `GET /v3/REST/sender/{sender_ID}` — inspect a sender.
- `PUT /v3/REST/sender/{sender_ID}` — update a sender.
- `DELETE /v3/REST/sender/{sender_ID}` — delete a sender.
- `POST /v3/REST/sender/{sender_ID}/validate` — request sender/domain validation.
- `GET /v3/REST/dns` — list SPF/DKIM records for sender domains.
- `GET /v3/REST/dns/{dns_ID}` — inspect one sender domain’s DNS settings.
- `POST /v3/REST/dns/{dns_ID}/check` — request a DNS validation check.

Mailjet requires the sender email address or domain to be registered and validated before it can send. Domain validation may require DNS changes outside Mailjet; report the SPF/DKIM records but do not modify an external DNS provider through this skill.

## Workflow

1. Resolve the exact sender email/domain, sender ID, DNS ID or domain, and requested operation.
   Completion: one concrete sender/DNS target and operation are resolved.
2. Read the sender and relevant DNS records before creating, updating, or validating. Confirm `Status: Active` before using a sender for delivery.
   Completion: the sender status and required DNS records are observed.
3. For a create, update, validation/check action, or delete, obtain explicit confirmation immediately before the write.
   Completion: confirmation names the exact sender/DNS target and action, or the operation is paused.
4. Read the sender or DNS resource back and report status, validation method, and records.
   Completion: the observed sender/DNS state or precise API failure is reported.

Official references: [Sender](https://dev.mailjet.com/email/reference/sender-addresses-and-domains/sender/), [Senders and Domains guide](https://dev.mailjet.com/email/guides/senders-and-domains/), and [DNS](https://dev.mailjet.com/email/reference/sender-addresses-and-domains/dns/).
