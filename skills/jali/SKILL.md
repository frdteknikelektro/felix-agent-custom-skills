---
name: jali
description: ALWAYS ACTIVE in the Jali deployment. Use every turn to check the current thread's JALA authentication, accept jali-auth.json through opaque secret handling, and read or change JALA data with the requester's existing API permissions.
metadata:
  author: felix-agent
  kind: operational
  version: "2.0.0"
env:
  - key: JALI_JALA_BASE_URL
    description: HTTPS JALA origin without /api; defaults to https://app.jala.tech
    required: false
    secret: false
    default: https://app.jala.tech
---

# Jali

Help the person work with their JALA data. Read this skill every turn and use
its current-event authentication check before any JALA operation. General
conversation can continue without accessing JALA. This is a custom skill for
one shared stock Felix instance; it does not modify Felix core.

## Access

Run `python3 scripts/jali.py --event-file <current_event> status` from this skill's
folder, using the exact `event_file` supplied by the runtime. The helper derives
the sender and thread from that event; never substitute a historical event or
another person's thread. A saved `jala-<id>` record alone does not authenticate
a new thread.

- `authenticated`: continue with JALA work.
- `authentication_required`: explain the dependent task and request a
  **jali-auth.json** file. Read [authentication](references/authentication.md)
  before collection or consumption. Use `secrets-handling` when collecting
  missing credentials; retain its permissions/consent and opaque-value rules.
- `store_unavailable`: stop dependent JALA work
  for Owner repair; a storage failure is not missing authentication.
- `identity_mismatch`: stop. A different profile must not replace this sender's
  established identity.

A supplied file is processed only as an authorized credential attachment for
this requester/thread. The consuming helper reads its bytes internally; do not
open, cat, summarize, preview, echo or put the values in prompts, arguments,
transcripts or Memory. Only statuses, profile identity and API results may reach
the model. Available authorized credentials need no new collection; missing
credentials follow the existing secrets-handling intake workflow.

Completion: this thread's own helper check authorizes JALA access, or the
requester receives the appropriate authentication/setup next step.

## Use cases

Read the linked case before its operation:

- [Authenticate a new thread](references/use-cases/authenticate-thread.md):
  automatic upload, validation and session-scoped persistence.
- [Read JALA data](references/use-cases/read-data.md): profile/farm lookup,
  selecting the requested resource and reporting actual API results.
- [Change JALA data](references/use-cases/change-data.md): resolve the endpoint,
  target and supplied values, execute the requested change and verify it.
- [Renew or disconnect](references/use-cases/renew-authentication.md): expired
  credentials, a fresh upload, thread disconnect and another thread's access.

## JALA requests

Use only `scripts/jali.py request`, with the current `--event-file`. It selects
the saved credential internally and returns the JALA result. Never look up the
JSON store yourself, pass a `jala-<id>` override, or attach credentials to a
manual curl/fetch request. Read the chosen use case for exact commands.

Use documented JALA routes and fields. Existing JALA user/resource policies
remain authoritative. Don't guess a write endpoint, invent required values,
claim a request succeeded from an admission/status alone, or retry an uncertain
write automatically. A rejected action stays rejected; no other account fallback.

Jali declares no additional Felix permissions: the verified JALA identity and
API policies govern JALA data. This does not bypass permissions of cooperating
skills such as secrets-handling, or grant Owner authority.

## Storage and scope

`JALI_JALA_BASE_URL` selects the deployment's JALA HTTPS origin (default
`https://app.jala.tech`). The helper appends `/api/...`; configure an origin,
not a URL ending in `/api`. A configured invalid/empty origin stops requests
with `invalid_jala_base_url`, without falling back to production. Each deployment belongs to one JALA environment. An origin change requires
a fresh session and authentication.

Each thread retains its accepted native attachment under its own
`attachments/api-inputs/file_<uuid>.bin`. The helper stores only the active
file ID, verified identity, origin, status and revision in `.jali/auth-state.json`
inside that thread. Credentials are never copied into a global JSON store.
The session directory lives in the existing persistent container home storage.

Every new thread needs its own upload. A new `jali-auth.json` may also arrive
in the middle of the same thread: validate it before switching, reject another
identity, then delete the superseded file bytes. Renewal and disconnect affect
only this thread; other threads retain their own credentials.

Event selection and secret hiding are instruction-driven, not OS isolation.
Contact/key provisioning belongs to the app/Owner. The app rotates a key on
login, like Notakuy; this skill never rotates it during JALA authentication.

## Widget protocol

For an input beginning `[[jali-internal:init:`, initialize without accessing
JALA and reply `Ready.` Do not ask for manual credentials: the widget will upload.
For an input beginning `[[jali-internal:auth:`, process the referenced attachment
through the helper. End the reply with exactly `<jali-auth>` followed by the
helper's safe JSON result and `</jali-auth>`. Include its actual file_id and
user_id on success. Never infer success from a completed turn or substitute
another attachment. For auth failure with no file_id in the helper result,
include the referenced attachment's file ID and safe failure status only.

For widget operations, read [BYOP widget](references/use-cases/byop-widget.md).
Preserve `[[jali-op:...]]` operation identity without echoing the prefix in replies.
