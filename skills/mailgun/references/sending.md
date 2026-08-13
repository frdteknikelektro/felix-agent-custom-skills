# Sending Email

Required permission: `send`.

Use `POST /v3/{domain_name}/messages` for ordinary messages and `POST /v3/{domain_name}/messages.mime` when the user provides or requests a complete MIME message. Both use multipart form data and Basic Auth with username `api`.

## Preflight

Before sending, confirm all of the following:

- Exact sending domain and region
- `from`
- At least one recipient in `to`, `cc`, or `bcc`
- `subject`, unless the supplied MIME message already contains it
- One content source: `text`, `html`, `amp-html`, or `template`
- Any attachments, tags, variables, tracking, delivery time, or test mode the user explicitly requested

Resolve the recipient list before building the request. A phrase such as “send it out” is not a recipient list; ask for the exact addresses or confirmed mailing-list target.

## Multipart example

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -X POST "$MAILGUN_API_BASE_URL/v3/$MAILGUN_DOMAIN/messages" \
  -F "from=Acme <no-reply@example.com>" \
  -F "to=person@example.net" \
  -F "subject=Your subject" \
  -F "text=Plain-text body" \
  -F "html=<html>HTML body</html>"
```

For files, use `-F 'attachment=@/absolute/path/file.pdf'` and verify the path is in scope before sending. For inline assets, use `-F 'inline=@/absolute/path/image.png'`.

Useful optional Mailgun fields include:

- `recipient-variables` — JSON map for per-recipient variables; batches support up to 1,000 recipients.
- `template`, `t:version`, `t:variables` — stored template and its variables.
- `o:tag` — message tag.
- `o:testmode=yes` — prevent delivery while exercising the API.
- `o:tracking`, `o:tracking-clicks`, `o:tracking-opens` — explicit tracking controls.
- `v:*` — custom variables returned in event/webhook data; do not put secrets or unnecessary PII in them.

## Result handling

Report the API response’s message ID and status. A successful acceptance response means Mailgun accepted the message for processing; it does not prove delivery. Use the Events/Logs or Metrics references to investigate delivery afterward.

## Safety

Use `o:testmode=yes` only when the user requests a non-delivering test. Keep credentials and access tokens out of headers, variables, tags, and message content. Treat recipient variables and message bodies as sensitive data.

Official references: [Send an email](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/messages/post-v3--domain-name--messages) and [Authentication](https://documentation.mailgun.com/docs/mailgun/api-reference/mg-auth).
