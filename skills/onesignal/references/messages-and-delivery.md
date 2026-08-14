# Messages and Delivery

Required permission: `read` for message inspection and delivery evidence; `write` for cancellation. Message cancellation requires explicit destructive confirmation naming the exact App ID, message ID, and cancellation action immediately before execution.

## Message resources

- `GET /notifications?app_id={app_id}` — list messages. Use `limit` up to 50 with `offset`, or use `time_offset` and the returned `next_time_offset` for cursor-style retrieval.
- `GET /notifications/{message_id}?app_id={app_id}` — view one message and its outcomes.
- `DELETE /notifications/{message_id}?app_id={app_id}` — cancel a scheduled or currently outgoing message; this does not delete the message record and may not stop already-dispatched deliveries.
- Export per-message recipient activity through [Message Data Exports](exports.md); treat it as a sensitive asynchronous download rather than an ordinary read.

For export retention, plan requirements, event limitations, and CSV download handling, load [Message Data Exports](exports.md). Do not promise historical availability beyond the official retention behavior.

## Verification workflow

1. Resolve the exact App ID and message ID, or the requested time window and filters.
   Completion: one concrete message query, history request, or cancellation target is resolved.
2. For a list, use the documented page size and cursor/offset rules. For one message, inspect `successful`, `received`, `failed`, `errored`, `canceled`, `remaining`, and `outcomes` when returned.
   Completion: the response scope and pagination state are captured.
3. For cancellation, obtain explicit destructive confirmation immediately before the `DELETE`; report that in-progress delivery may not be fully stopped.
   Completion: the cancellation target is confirmed or the operation is paused.
4. For exports, follow [Message Data Exports](exports.md). Treat an accepted export as asynchronous until the file is ready; redact returned URLs.
   Completion: observed delivery evidence, export state, or precise API failure is reported.

Separate OneSignal acceptance, successful/received counts, provider delivery, and user engagement. Never claim delivery from the create-message response alone.

Official references: [View messages](https://documentation.onesignal.com/reference/view-messages), [View message](https://documentation.onesignal.com/reference/view-message), [Cancel message](https://documentation.onesignal.com/reference/cancel-message), and [Message history](https://documentation.onesignal.com/reference/message-history).
