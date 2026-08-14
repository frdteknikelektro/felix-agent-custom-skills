# Message Data Exports

Required permission: `read`. Exported message and audience activity can contain recipient PII and message content. Resolve the exact App ID, message or time scope, and approved destination before downloading or forwarding. A read-only export does not require a write confirmation; cancellation still follows the destructive confirmation gate in [Messages and Delivery](messages-and-delivery.md).

## Choose the API path

- `GET /notifications?app_id={app_id}&limit=50&offset=0` — page API-visible message records and aggregate delivery/outcome fields. Use offset pagination or `time_offset` with the returned `next_time_offset`. One page contains at most 50 messages. The REST message list does not include Journey-sent messages.
- `GET /notifications/{message_id}?app_id={app_id}` — inspect one message’s configuration and outcomes.
- `POST /notifications/{message_id}/history` — create an asynchronous CSV of per-subscription activity for one message. Send `app_id` and an `events` value of `sent` or `clicked`; an optional `email` asks OneSignal to email the report when ready.
- Event Streams — configure ongoing, near-real-time message event delivery when the requirement is continuous export rather than a one-off REST download.

For “export all sent messages,” page `GET /notifications` and retain each returned message ID. For recipient-level activity, request Message History separately for each message; the endpoint does not create one bulk CSV for every message in the app.

## Message History constraints

Message History is not universally available. Before requesting it, verify all of the following:

- The account is on a Professional or Enterprise plan.
- The OneSignal setting `Send History via OneSignal API` is enabled.
- The message was sent after that setting was enabled; enabling it does not make earlier message history available.
- The request is made within 7 days after the message was sent.
- The requested event is supported: `sent` or `clicked`. Opens are not supported.

The `sent` event is not recorded for messages targeting fewer than 1,000 recipients. The `clicked` event has no equivalent recipient-count threshold. Treat a successful request as an export job, not as proof that every recipient row exists.

## Asynchronous download workflow

1. Resolve the exact App ID, message ID, requested event, and approved storage or delivery destination.
2. Submit `POST /notifications/{message_id}/history` with the app ID and event. A successful request returns `202` and an export handoff such as `destination_url`.
3. Poll the returned export URL only when authorized. The report usually takes 1–3 minutes; poll about every 10 seconds. A `403` while the file is being prepared can be transient according to the official guidance.
4. Store the CSV in an approved location, limit access, and report counts or a redacted summary. Do not paste recipient rows, signed URLs, or message content into the chat unless explicitly required.

Example request:

```bash
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Authorization: Key $ONESIGNAL_APP_API_KEY" \
  -H "Content-Type: application/json" \
  "$ONESIGNAL_API_BASE_URL/notifications/$MESSAGE_ID/history" \
  --data '{"app_id":"'$ONESIGNAL_APP_ID'","events":"sent"}'
```

Use a shell-safe JSON encoder when App IDs or other values are not trusted literals. Never log the API key or the returned export URL.

## Retention and ongoing export

- API-created messages are generally available for about 30 days.
- Dashboard-created messages may remain available for the app’s lifetime.
- Audience activity exports are generally available for about 30 days.
- Event Streams are the appropriate branch for ongoing event export; their API and Journey event data is generally retained for about 30 days.

These are availability constraints, not guarantees of a complete historical archive. If the requested range is older, report that the API may no longer have the source data and do not invent missing rows.

Official references: [Exporting data](https://documentation.onesignal.com/docs/en/exporting-data), [View messages](https://documentation.onesignal.com/reference/view-messages), [View message](https://documentation.onesignal.com/reference/view-message), [Message history](https://documentation.onesignal.com/reference/message-history), and [Event Streams data](https://documentation.onesignal.com/docs/en/event-streams-data).
