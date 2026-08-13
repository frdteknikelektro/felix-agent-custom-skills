# Sending Email

Required permission: `send`. Every send requires explicit confirmation immediately before submission; name the validated sender, recipient scope, and message or template in the confirmation.

Use Send API v3.1:

- `POST /v3.1/send` — submit one or more transactional messages as JSON.
- Send API v3.1 accepts up to 50 message objects per call. A message can contain multiple `To`, `Cc`, or `Bcc` recipients.

## Preflight

Before sending, confirm all of the following:

- An exact `From.Email` that is registered and active for the Mailjet API key
- At least one exact recipient in `To`, `Cc`, or `Bcc`
- A subject or a selected template that supplies it
- One content source: `TextPart`, `HTMLPart`, or a `TemplateID` with the required template settings
- Any attachments, inline attachments, headers, variables, tags, or tracking controls explicitly requested

Do not treat a mailing-list name or “send it out” as a recipient list. Resolve exact addresses or a confirmed Mailjet contact-list workflow before building the payload.

## JSON example

```bash
curl --fail-with-body --silent --show-error \
  --user "$MAILJET_API_KEY:$MAILJET_SECRET_KEY" \
  -X POST "$MAILJET_API_BASE_URL/v3.1/send" \
  -H "Content-Type: application/json" \
  -d '{
    "Messages": [{
      "From": {"Email": "no-reply@example.com", "Name": "Example"},
      "To": [{"Email": "recipient@example.net"}],
      "Subject": "Example message",
      "TextPart": "Message body"
    }]
  }'
```

For a stored template, use `TemplateID`, `TemplateLanguage`, and `Variables` as documented by the official Send API guide. Attachments and inline attachments require base64 content, a MIME type, and a file name.

## Sandbox mode

Set the root payload property `SandboxMode` to `true` only for an explicitly requested non-delivering validation. Sandbox responses omit message IDs and UUIDs when processing succeeds; they do not prove delivery.

## Result handling

Report each returned message status and available `MessageID`/`MessageUUID`. A successful Send API response means Mailjet accepted the request for processing, not that the recipient received it. Use [events-and-statistics](events-and-statistics.md) for delivery evidence.

Official references: [Send API v3.1 guide](https://dev.mailjet.com/email/guides/send-api-v31/index.html) and [Send Emails API reference](https://dev.mailjet.com/email/reference/send-emails/).
