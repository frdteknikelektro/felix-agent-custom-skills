# Message Events and Statistics

Required permission: `read` for message and statistics inspection; `write` for creating, updating, or deleting event callback URLs. Every callback mutation requires explicit confirmation of the exact URL target and action immediately before execution.

## Message evidence

- `GET /v3/REST/message` — list processed messages.
- `GET /v3/REST/message/{message_ID}` — inspect one message.
- `GET /v3/REST/messagehistory/{message_ID}` — retrieve sent, open, click, bounce, block, unsubscribe, and spam events for one message.
- `GET /v3/REST/messageinformation` — query message sending, size, and spam information.
- `GET /v3/REST/messageinformation/{message_ID}` — inspect one message’s sending information.

Event records can show `sent`, `opened`, `clicked`, `bounced`, `blocked`, `unsub`, or `spam`. Distinguish a send acceptance response from a later delivery or engagement event.

## Statistics and callbacks

- `GET /v3/REST/statcounters` — query key performance statistics by API key, campaign, list, or sender and by message/event timing.
- `GET /v3/REST/eventcallbackurl` — list event callback URLs.
- `POST /v3/REST/eventcallbackurl` — create a callback URL.
- `GET /v3/REST/eventcallbackurl/{url_ID}` — inspect one callback.
- `PUT /v3/REST/eventcallbackurl/{url_ID}` — update a callback.
- `DELETE /v3/REST/eventcallbackurl/{url_ID}` — delete a callback.

## Workflow

1. Resolve the exact message ID, time/filter window, statistic source, or callback URL target.
   Completion: one concrete read or callback operation is resolved.
2. Query message history for individual outcomes and `statcounters` for aggregates. Use the callback resource only when the user asks to inspect or change webhook configuration.
   Completion: the requested response, pagination, and filter state are captured.
3. For a callback create, update, or delete, obtain explicit confirmation immediately before the request and keep callback credentials out of output.
   Completion: the exact callback target is confirmed or the operation is paused.
4. Report observed IDs, event types, states, counts, filters, and remaining uncertainty. Do not infer delivery from acceptance or aggregate counts alone.
   Completion: the report separates observed events from interpretation.

Prefer current `statcounters` and message-history resources for new investigations. Treat older statistics endpoints as legacy when encountered.

Official references: [Messages](https://dev.mailjet.com/email/reference/messages/), [Statistics guide](https://dev.mailjet.com/email/guides/statistics/), and [Mailjet API reference](https://dev.mailjet.com/email/reference/).
