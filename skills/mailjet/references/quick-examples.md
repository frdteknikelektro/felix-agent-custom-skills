# Quick Examples

Set the runtime variables before each recipe. Never print `MAILJET_API_KEY` or `MAILJET_SECRET_KEY`.

## List active senders

```bash
curl --fail-with-body --silent --show-error \
  --user "$MAILJET_API_KEY:$MAILJET_SECRET_KEY" \
  -H "Accept: application/json" \
  "$MAILJET_API_BASE_URL/v3/REST/sender?Status=Active&Limit=100"
```

## Send a sandbox validation

Use `send`, an exact validated sender, and exact recipients. Obtain explicit confirmation immediately before the request, naming the sender, recipients, and validation-only scope. Sandbox mode validates the payload without delivering it:

```bash
curl --fail-with-body --silent --show-error \
  --user "$MAILJET_API_KEY:$MAILJET_SECRET_KEY" \
  -X POST "$MAILJET_API_BASE_URL/v3.1/send" \
  -H "Content-Type: application/json" \
  -d '{
    "SandboxMode": true,
    "Messages": [{
      "From": {"Email": "no-reply@example.com"},
      "To": [{"Email": "recipient@example.net"}],
      "Subject": "Mailjet sandbox test",
      "TextPart": "Validation only"
    }]
  }'
```

## Retrieve message history

```bash
curl --fail-with-body --silent --show-error \
  --user "$MAILJET_API_KEY:$MAILJET_SECRET_KEY" \
  -H "Accept: application/json" \
  "$MAILJET_API_BASE_URL/v3/REST/messagehistory/$MESSAGE_ID"
```

Sandbox acceptance is not delivery. Use a real message ID and message history for delivery evidence.
