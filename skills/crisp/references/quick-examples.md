# Crisp safe request examples

Use the bundled `scripts/crisp_api.py` transport for every request. It loads authentication from the injected token variables and enforces the configured `CRISP_WEBSITE_ID` path boundary.

Keep token values out of logs, replies, command-line arguments, and committed files.

## Inspect a workspace

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID"
```

## List the first conversation page

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID/conversations/1" \
  --query "per_page=20"
```

## Read messages for one session

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID/conversation/$SESSION_ID/messages"
```

## Send a confirmed text message

After explicit confirmation naming the exact workspace, session, sender, origin, and content summary:

```sh
python3 skills/crisp/scripts/crisp_api.py \
  POST "/v1/website/$CRISP_WEBSITE_ID/conversation/$SESSION_ID/message" \
  --json '{"type":"text","from":"operator","origin":"chat","content":"CONFIRMED_MESSAGE_TEXT"}'
```

Treat the response as send acceptance, not proof of delivery.

## Update conversation state

After explicit confirmation:

```sh
python3 skills/crisp/scripts/crisp_api.py \
  PATCH "/v1/website/$CRISP_WEBSITE_ID/conversation/$SESSION_ID/state" \
  --json '{"state":"resolved"}'
```

## Add a custom header

Use `--header` only for non-sensitive values. The script manages authentication and transport framing headers:

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID" \
  --header "X-Request-Source: felix"
```

Do not override `Authorization`, `X-Crisp-Tier`, `Cookie`, `Host`, or transport framing headers.

## Official source

Use the [Crisp REST API reference](https://docs.crisp.chat/references/rest-api/v1/) when route, schema, scope, or response behavior is not already established.

Completion: example adapted to the exact target and all send, write, and destructive gates satisfied.
