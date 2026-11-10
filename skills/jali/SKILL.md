---
name: jali
description: ALWAYS ACTIVE in the Jali deployment. Use every turn to check the current thread's JALA authentication, accept jali-auth.json through opaque secret handling, and read or change JALA data with the requester's existing API permissions.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
env:
  - key: JALI_PRIVATE_DIR
    description: Private persistent credential directory outside WORKSPACE_DIR; defaults to /run/jali-private
    required: false
    secret: false
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
- `private_store_unavailable` or `store_unavailable`: stop dependent JALA work
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
  welcome, fixed file format, validation, private persistence and cleanup.
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

The Owner configures `JALI_PRIVATE_DIR` (default `/run/jali-private`) as a private
persistent mount **outside WORKSPACE_DIR**. `auth.json` stores user credentials
under `jala-<verified profile id>`, sender bindings, and explicit per-thread
authentication. Only the helper reads/writes it; writes use a process lock and
atomic replacement, with restrictive file modes. Do not share or inspect it.

Every new thread needs its own authentication upload, even for a known user.
Threads for the same verified user use that user's latest valid saved credential;
a successful renewal updates it for those threads without authenticating new
ones. Disconnect removes the current thread's binding, not the user's Felix key.

Event selection and secret hiding are instruction-driven, as in Notakuy's helper
workflow. This is not filesystem/process isolation against an unrestricted shell.
Felix contact/API-key provisioning remains with the app or Owner through existing
Owner APIs. This skill needs no Owner password, changes no contact permissions,
and never rotates/revokes the persistent Felix key on thread authentication.
