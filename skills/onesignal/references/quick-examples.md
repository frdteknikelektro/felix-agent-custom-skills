# Quick Examples

Set the runtime variables before each recipe. Never print `ONESIGNAL_APP_API_KEY` or `ONESIGNAL_ORG_API_KEY`.

## List apps with organization scope

```bash
curl --fail-with-body --silent --show-error \
  -H "Authorization: Key $ONESIGNAL_ORG_API_KEY" \
  "$ONESIGNAL_API_BASE_URL/apps"
```

## View a Jala or app-scoped user

```bash
curl --fail-with-body --silent --show-error \
  -H "Authorization: Key $ONESIGNAL_APP_API_KEY" \
  "$ONESIGNAL_API_BASE_URL/apps/$ONESIGNAL_APP_ID/users/by/external_id/$ALIAS_ID"
```

## Send a push to a segment

Obtain explicit confirmation immediately before submission, naming the App ID, segment, content, and channel.

```bash
curl --fail-with-body --silent --show-error \
  -X POST "$ONESIGNAL_API_BASE_URL/notifications" \
  -H "Authorization: Key $ONESIGNAL_APP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "APP_ID",
    "target_channel": "push",
    "included_segments": ["Subscribed Users"],
    "contents": {"en": "Example message"}
  }'
```

Save a returned `id` and use [messages-and-delivery](messages-and-delivery.md) to inspect outcomes. A successful request is not proof that users received the message.
