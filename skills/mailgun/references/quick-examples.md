# Quick Examples

Set the runtime variables before each recipe. Never print `MAILGUN_API_KEY`.

## Verify an account key

Use only for a private account API key, not a domain sending key:

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -H "Accept: application/json" \
  "$MAILGUN_API_BASE_URL/v4/domains?limit=1"
```

## List domains

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -H "Accept: application/json" \
  "$MAILGUN_API_BASE_URL/v4/domains?limit=100"
```

## Send a test-mode message

Use `send`, an exact recipient, and a confirmed domain:

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -X POST "$MAILGUN_API_BASE_URL/v3/$MAILGUN_DOMAIN/messages" \
  -F "from=Test <no-reply@example.com>" \
  -F "to=recipient@example.net" \
  -F "subject=Mailgun test" \
  -F "text=Test message" \
  -F "o:testmode=yes"
```

Test mode still exercises API acceptance but prevents delivery; it does not replace permission checks or recipient confirmation.

## List recent legacy events

Use only when the user requests the Events API or a legacy workflow requires it:

```bash
curl --fail-with-body --silent --show-error \
  --user "api:$MAILGUN_API_KEY" \
  -H "Accept: application/json" \
  --get "$MAILGUN_API_BASE_URL/v3/$MAILGUN_DOMAIN/events" \
  --data-urlencode "begin=$(date -u -d '1 day ago' +%s)" \
  --data-urlencode "end=$(date -u +%s)" \
  --data-urlencode "limit=100"
```

This uses the GNU `date` available in the Felix container. Prefer `/v1/analytics/logs` for new work.
