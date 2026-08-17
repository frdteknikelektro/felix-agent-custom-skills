---
name: crisp
description: Crisp REST API operations for conversations, messages, people profiles, visitors, operators, inboxes, campaigns, analytics, and profile exports. Use when inspecting, sending, updating, managing, or exporting Crisp workspace data.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: read, send, write
  match: crisp, Crisp API, Crisp conversation, Crisp message, Crisp people profile, Crisp visitor, Crisp inbox, Crisp campaign, Crisp analytics
env:
  - key: CRISP_TOKEN_ID
    description: Crisp website-token identifier or plugin-token identifier. Keep it private with the token key.
    required: true
    secret: true
  - key: CRISP_TOKEN_KEY
    description: Crisp website-token secret or plugin-token key used for Basic Auth.
    required: true
    secret: true
  - key: CRISP_TOKEN_TIER
    description: Crisp authentication tier; use website for a single workspace or plugin for multi-workspace access.
    default: website
    required: true
    secret: false
  - key: CRISP_WEBSITE_ID
    description: Exact Crisp workspace identifier used as the website_id data boundary. Never infer it from a domain or workspace name.
    required: true
    secret: false
  - key: CRISP_API_BASE_URL
    description: Crisp REST API host.
    default: https://api.crisp.chat
---

# Crisp

## Purpose

Operate Crisp through its REST API while preserving the exact workspace boundary, token tier, conversation target, recipient data, confirmation, and post-write verification rules.

## When to use

Use for Crisp conversations, messages, people profiles, visitor inspection, operators, inboxes, campaigns, analytics, or profile exports.

## Out of scope

- Crisp RTM event streaming, webhooks, SDK installation, chatbox configuration, or Marketplace plugin development; use the corresponding Crisp documentation.
- Creating, rotating, revoking, or requesting approval for Crisp tokens; those are dashboard or Marketplace administration steps.
- Guessing `CRISP_WEBSITE_ID`, a conversation `session_id`, message `fingerprint`, `people_id`, inbox, operator, campaign, or export recipient.

## Use Cases

- **Inspect or operate conversations** — resolve the exact workspace and session, then load [conversations](references/conversations.md).
- **Manage people or inspect visitors** — resolve the exact `people_id` or workspace, then load [people-and-visitors](references/people-and-visitors.md).
- **Inspect workspace operations** — load [workspace-and-analytics](references/workspace-and-analytics.md) for operators, availability, inboxes, campaigns, and analytics.
- **Authenticate or troubleshoot limits** — load [authentication](references/authentication.md).
- **Call Crisp through the bundled transport** — use [quick-examples](references/quick-examples.md) for the request shape and managed authentication.
- **Use a safe request recipe** — load [quick-examples](references/quick-examples.md) after the target and operation are resolved.

## Permissions

Permissions are skill-local; Felix adds the `crisp:` namespace when it evaluates grants.

- `read` — inspect websites, conversations, messages, people, visitors, operators, inboxes, campaigns, analytics, or settings.
- `send` — send a message in an existing conversation or dispatch/test/resume a campaign when the selected Crisp route is a send operation.
- `write` — create or update conversations, message content, conversation state, people data, inboxes, settings, campaign configuration, or other documented workspace state.

Use `send` for outbound conversation messages even though Crisp uses `POST`. Every send and every state-changing write requires explicit confirmation naming the exact `website_id`, target identifier, operation, and relevant payload summary immediately before execution. Deleting a website, conversation, message, people profile, inbox, operator membership, or other existing resource requires an additional destructive confirmation naming the exact resource and deletion effect.

## Workflow

1. **Authorize.** Read the server-computed `permissions_per_skill` row for `crisp`; treat `have=[...]` as authoritative. Map the request to the narrowest permission above. If it is under `need=[...]`, emit exactly one `PERMISSION_REQUIRED` block using Felix’s output contract and stop.
   Completion: the required permission is authorized, or the complete permission request is emitted.
2. **Resolve the workspace and target.** Confirm `CRISP_WEBSITE_ID`, `CRISP_TOKEN_TIER`, and the exact conversation, session, message, person, inbox, operator, campaign, or analytics scope. A website token can access only its one workspace; a plugin token still requires an explicit target website.
   Completion: one concrete workspace boundary, operation, and target scope are resolved.
3. **Load the branch.** Read [authentication](references/authentication.md), [conversations](references/conversations.md), [people-and-visitors](references/people-and-visitors.md), [workspace-and-analytics](references/workspace-and-analytics.md), or [quick-examples](references/quick-examples.md). Recheck the linked official Crisp page when a route, schema, token scope, or quota may have changed.
   Completion: the selected branch and its official source are loaded.
4. **Preflight credentials.** Confirm `CRISP_TOKEN_ID`, `CRISP_TOKEN_KEY`, and `CRISP_TOKEN_TIER` without displaying them. Use the bundled [transport script](scripts/crisp_api.py), which assembles Basic Auth and `X-Crisp-Tier` without placing secrets in URLs or logs.
   Completion: the correct token tier and credential pair are ready, or the redacted blocker is reported.
5. **Validate and confirm.** URL-encode path and query values, validate required IDs and message fields, and identify whether the route sends, writes, deletes, or only reads. Immediately before every send or write, obtain explicit confirmation naming the exact workspace, target, operation, and payload summary; obtain destructive confirmation before deletion or irreversible state removal.
   Completion: the request is valid and confirmed, or execution is paused.
6. **Execute.** Run the bundled [transport script](scripts/crisp_api.py) against the documented `/v1/...` path. It URL-encodes query values, enforces the configured workspace boundary, adds managed authentication headers, and retries reads with bounded backoff on explicit `429` or `420` responses. Never blindly retry a send or mutation after an ambiguous timeout; use `--retry-mutations` only for an explicit retry decision after a known `420`/`429` response.
   Completion: Crisp returns a documented success envelope/status, or a redacted failure is captured.
7. **Verify and report.** Re-read the changed resource when a read route exists. For sends, report acceptance and returned identifiers separately from delivery or operator/user receipt. For profile exports, report that Crisp emails the export to the requester rather than claiming a local download.
   Completion: the observed result, relevant identifiers, remaining uncertainty, and redacted failure are reported.

## Environment

Felix injects the declared variables before the turn. Keep `CRISP_TOKEN_ID` and `CRISP_TOKEN_KEY` secret. Use `CRISP_TOKEN_TIER=website` for a website token and `CRISP_TOKEN_TIER=plugin` for a Marketplace plugin token. `CRISP_WEBSITE_ID` is the required exact workspace boundary.

Crisp’s REST API host is `https://api.crisp.chat`. Use `CRISP_API_BASE_URL` only for an explicitly configured compatible host.

Use the bundled script for every API request:

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID"
```

Use `--header` only for non-sensitive headers. The script rejects attempts to override managed authentication or transport framing headers.

## Checks

- Keep both token values private and keep the token tier aligned with the configured credential; never substitute a website token for a plugin token or vice versa.
- Use `scripts/crisp_api.py` for every request. Keep token values out of command-line arguments or committed files; use `--header` only for non-sensitive values.
- Treat `CRISP_WEBSITE_ID` as the data boundary. Do not infer it from a human-readable domain or workspace name.
- Before every send or state-changing write, confirm the exact workspace, target, operation, and payload. Before deletion, confirm the exact resource and deletion effect immediately before the call.
- Use Crisp’s documented route-specific scope requirements for plugin tokens; a valid Basic Auth pair does not imply every route is authorized.
- Treat conversation content, people profiles, emails, phone numbers, visitor data, export requests, and message attachments as sensitive. Redact them unless needed to complete the requested operation.
- Report the HTTP method, redacted path, status, Crisp `error`/`reason` fields, returned identifiers, and observed state. Do not claim delivery from a successful send response alone.

Route Crisp work through this skill instead of embedding Crisp credentials or API calls in another skill.
