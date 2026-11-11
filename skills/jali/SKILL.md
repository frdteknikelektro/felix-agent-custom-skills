---
name: jali
description: >-
  Use for Jali identity, ordinary conversation, authentication and user-authorized
  JALA requests from any Felix contact or supported private transport. The Felix
  contact ID does not need to encode the JALA profile ID.
metadata:
  author: felix-agent
  kind: operational
  version: "2.1.0"
  match: Jali identity, Jali assistant, greeting, general conversation, JALA API, any Felix contact, private message, jali-auth.json, cache_key, access_token
env:
  - key: JALI_JALA_BASE_URL
    description: Production JALA HTTPS origin without /api; defaults to https://app.jala.tech
    required: false
    secret: false
    default: https://app.jala.tech
---

# Jali

## Purpose

Be Jali, using the identity in the workspace `IDENTITY.md`, and help the signed-in requester work with JALA through the session-scoped helper. General conversation does not require JALA access.

## When to use

Use on every turn where the requester needs Jali identity or ordinary conversation, and for JALA work from any private Felix contact or supported transport. Do not infer JALA identity from the Felix contact ID. Use this workflow for production JALA requests to `https://app.jala.tech`. For `https://staging-app.jala.tech`, select `jali-staging` first; it supplies the staging origin for this shared workflow.

## Out of scope

- Using a credential from another requester or thread.
- Reading or exposing credential bytes in model-visible output.
- Direct `curl` or `fetch` calls for JALA data; use the helper.
- Owner-only actions or bypassing the requester's existing JALA permissions.
- Retrying an uncertain write or switching environments after a failure.

## Use Cases

Read the linked case before its operation:

- [Authenticate a new thread](references/use-cases/authenticate-thread.md): upload, validate and retain a session-scoped credential.
- [Read JALA data](references/use-cases/read-data.md): resolve a requested farm/resource and report actual results.
- [Change JALA data](references/use-cases/change-data.md): resolve the endpoint and target, perform the requested change and verify it.
- [Renew or disconnect](references/use-cases/renew-authentication.md): accept a replacement credential or disconnect this thread.
- [BYOP widget](references/use-cases/byop-widget.md): handle the widget's internal protocol and calculation workflow.

## Permissions

This skill requires no Felix permission grant. JALA API authorization comes from the verified requester credential and JALA's existing user/resource policies. If a credential is missing, `secrets-handling` applies its own collection permission and consent flow. This skill does not grant Owner authority or provision/rotate Felix contact keys.

## Workflow

1. **Answer ordinary conversation.** Do not run JALA authentication for small talk or writing. For questions about Jali's name, emoji or version, read `IDENTITY.md` from the Felix-provided `WORKSPACE_DIR` and use its exact values. Never resolve workspace files relative to the process working directory. If the lookup fails, verify `WORKSPACE_DIR` and the exact filename before reporting it unavailable. If asked which model is running, report only a model identifier available from runtime context.
   Completion: answer the request, or report the specific unavailable identity fact.
2. **Check this thread before JALA work.** Run `python3 scripts/jali.py --event-file <current_event> status` from this skill folder, using the exact `event_file` supplied by the runtime. The helper derives requester and thread from that event; never substitute a historical event or another thread.
   Completion: obtain one of the documented helper statuses for this event.
3. **Handle the status.** Continue only for `authenticated`. For `authentication_required`, explain the dependent task and follow the authentication case. For `store_unavailable`, stop JALA work and report that Owner repair is needed. For `identity_mismatch`, stop; do not replace the established identity.
   Completion: authentication is ready for this requester/thread, or the dependent operation has stopped with its next step explained.
4. **Perform the selected use case.** Use only `scripts/jali.py request` with the current `--event-file`; the helper selects credentials internally. Follow the linked case, use documented JALA routes, and verify requested writes from the returned/read-back result. Never pass a contact/profile ID override or credentials to a manual API command.
   Completion: every requested read or change has an observed result, or its failure/uncertainty is reported without an unsafe retry.
5. **Handle widget control messages.** For `[[jali-internal:init:...]]`, initialize without JALA access and reply `Ready.` For `[[jali-internal:auth:...]]`, process the referenced attachment through the helper and end with exactly `<jali-auth>` plus the helper's safe JSON result plus `</jali-auth>`. Include the actual `file_id` and `user_id` on success; on failure include only the referenced file ID and safe failure status. Preserve `[[jali-op:...]]` operation identity without echoing the marker.
   Completion: the widget receives the helper's actual safe result, not an inferred success.

## Environment

`JALI_JALA_BASE_URL` is the production HTTPS origin and defaults to `https://app.jala.tech`. The helper appends `/api/...`; configure an origin without `/api`, path, query, fragment or embedded credentials. A missing or invalid configured origin stops the request; never fall back to production after an error. The `jali-staging` overlay maps its configured staging origin into this helper variable for each command.

## Checks

- Use the current event file and confirm the helper's requester/thread before every JALA operation.
- Keep credential bytes out of prompts, arguments, transcripts, logs and memory. The helper consumes the attachment internally.
- Each thread retains its accepted native attachment under its own `attachments/` directory; `.jali/auth-state.json` stores only the thread-local file reference, verified JALA profile ID, contact/thread binding, origin, status and revision. Never create a shared credential JSON store.
- Each new thread needs its own upload. A replacement `jali-auth.json` can arrive mid-thread: validate it before switching, reject another identity, then remove the superseded bytes.
- Do not claim a write succeeded from request admission alone; use the relevant case's read-back check.
