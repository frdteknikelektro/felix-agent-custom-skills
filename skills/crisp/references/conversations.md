# Crisp conversations and messages

Read this branch for conversation discovery, message history, message sending, state, read/delivered markers, assignment, or conversation deletion.

## Discover conversations

List a workspace’s conversations:

```text
GET /v1/website/{website_id}/conversations
```

The app API returns a partial-content list response. Resolve `website_id` from `CRISP_WEBSITE_ID`; add filters deliberately. Useful filters include `search_query` with `search_type=text|segment|filter`, `search_operator=and|or`, `filter_inbox_id`, unread/resolved/not-resolved/assigned/unassigned filters, date bounds, and ordering fields. URL-encode the query.

Inspect a single conversation:

```text
GET /v1/website/{website_id}/conversation/{session_id}
```

Create a conversation only when the user has supplied the intended workspace and creation purpose:

```text
POST /v1/website/{website_id}/conversation
```

Creating a conversation is a write and requires explicit confirmation naming the workspace and intended session/user scope.

## Read messages

Read the current batch of messages, then page by timestamp:

```text
GET /v1/website/{website_id}/conversation/{session_id}/messages
  ?timestamp_before={unix_timestamp}
  &timestamp_after={unix_timestamp}
  &timestamp_around={unix_timestamp}
```

The API returns the last batch when a conversation is large. Use `timestamp_before` for older messages, `timestamp_after` for newer messages, and `timestamp_around` for a centered window. Treat message content, attachments, emails, and visitor data as sensitive.

Read one message by its fingerprint:

```text
GET /v1/website/{website_id}/conversation/{session_id}/message/{fingerprint}
```

## Send a message

Send into an existing conversation with:

```text
POST /v1/website/{website_id}/conversation/{session_id}/message
```

The required body fields are `type`, `from`, `origin`, and `content`. Supported message types include `text`, `note`, `file`, `animation`, `audio`, `picker`, `field`, `carousel`, and `event`; `content` is a string for `text`/`note` and an object for the richer types. `from` is `user` or `operator`; `origin` is `chat`, `email`, or a documented `urn:*` value.

Minimal text-message shape:

```json
{
  "type": "text",
  "from": "operator",
  "origin": "chat",
  "content": "Message text supplied by the user"
}
```

Before execution, confirm the exact `website_id`, `session_id`, sender (`from`), origin, and a concise content summary. A successful API response means the message was accepted by Crisp; verify the conversation if the user asks whether it was actually seen or delivered.

## Change conversation state

Use the state route for `pending`, `unresolved`, or `resolved`:

```text
PATCH /v1/website/{website_id}/conversation/{session_id}/state
```

```json
{ "state": "resolved" }
```

State changes require explicit confirmation naming the exact workspace, session, current known state, and new state. The same confirmation rule applies to open-state, routing, inbox, metadata, block, and participant mutations.

Useful conversation routes:

| Operation | Method and path |
| --- | --- |
| Mark messages read | `PATCH /v1/website/{website_id}/conversation/{session_id}/read` |
| Mark messages delivered | `PATCH /v1/website/{website_id}/conversation/{session_id}/delivered` |
| Update open state | `PATCH /v1/website/{website_id}/conversation/{session_id}/open` |
| Get routing assignment | `GET /v1/website/{website_id}/conversation/{session_id}/routing` |
| Assign routing | `PATCH /v1/website/{website_id}/conversation/{session_id}/routing` |
| Get conversation metadata | `GET /v1/website/{website_id}/conversation/{session_id}/meta` |
| Update conversation metadata | `PATCH /v1/website/{website_id}/conversation/{session_id}/meta` |
| List events | `GET /v1/website/{website_id}/conversation/{session_id}/events/{page_number}` |
| List files | `GET /v1/website/{website_id}/conversation/{session_id}/files/{page_number}` |
| Delete conversation | `DELETE /v1/website/{website_id}/conversation/{session_id}` |
| Update a message | `PATCH /v1/website/{website_id}/conversation/{session_id}/message/{fingerprint}` |
| Delete a message | `DELETE /v1/website/{website_id}/conversation/{session_id}/message/{fingerprint}` |

Message and conversation deletion are destructive. Re-read the target when possible, obtain destructive confirmation immediately before the call, and report the exact fingerprint/session affected.

## Official source

Use the [Crisp REST API conversation reference](https://docs.crisp.chat/references/rest-api/v1/) for the current body schema, route scope, message content variants, and response codes.

Completion: the exact workspace/session, route, pagination or body fields, permission, confirmation, and verification plan are resolved.
