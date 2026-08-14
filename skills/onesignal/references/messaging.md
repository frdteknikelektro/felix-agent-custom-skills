# Messaging

Required permission: `send`. Every message requires explicit confirmation immediately before submission, naming the exact App ID, channel, audience scope, content/template, and schedule.

## Create a message

- `POST /notifications` — create a push, email, SMS, or supported OneSignal message.
- Use `Authorization: Key $ONESIGNAL_APP_API_KEY` and include the exact `app_id` in the JSON body.
- Set `target_channel` when required by the selected channel or targeting method. Current values include `push`, `email`, and `sms`; OneSignal treats RCS as part of the SMS channel.

Choose exactly one targeting method per message:

- `include_aliases` — target known `external_id`, `onesignal_id`, or custom aliases; up to 20,000 entries.
- `include_subscription_ids` — target known Subscription IDs; up to 20,000 entries.
- `email_to` — target email addresses for email messages; up to 20,000 entries.
- `include_phone_numbers` — target E.164 phone numbers for SMS/MMS/RCS; up to 20,000 entries.
- `included_segments` with optional `excluded_segments` — target existing segments.
- `filters` — build an ad-hoc audience; up to 200 total filter entries and logical operators.

Do not mix aliases, segments, filters, or the other audience methods in one request. Resolve channel setup and the exact target before constructing the payload.

## Message body

For push, provide localized `contents` and optionally `headings`, `data`, `url`, platform fields, or scheduling fields. Use channel-specific fields from the official guide for email, SMS/MMS/RCS, or Live Activities. Do not invent a template ID, sender identity, segment, or localization.

Example push request:

```bash
curl --fail-with-body --silent --show-error \
  -X POST "$ONESIGNAL_API_BASE_URL/notifications" \
  -H "Authorization: Key $ONESIGNAL_APP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "APP_ID",
    "target_channel": "push",
    "included_segments": ["Subscribed Users"],
    "headings": {"en": "Example"},
    "contents": {"en": "Example message"}
  }'
```

## Response and retry handling

OneSignal returns HTTP `200` when the request is valid and accepted. If an `id` is returned, save it as the message ID for later inspection. A valid response without an `id` may mean that no valid subscriptions matched the audience; report that distinction.

Do not blindly retry a timed-out message creation. Use a stable idempotency strategy on retries and bounded backoff for `429` or `5xx` responses, following the official rate-limit guidance.

Verify message outcomes with [messages-and-delivery](messages-and-delivery.md). Acceptance or creation is not proof of delivery.

Official references: [Create message](https://documentation.onesignal.com/reference/create-message), [Push notification](https://documentation.onesignal.com/reference/push-notification), and [Rate limits](https://documentation.onesignal.com/reference/rate-limits).
