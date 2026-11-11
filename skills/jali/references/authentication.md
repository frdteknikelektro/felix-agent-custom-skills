# Session authentication and renewal

The widget uploads `jali-auth.json` automatically. In other private
transports, the requester may attach the same file. For a supplied credential
attachment, collection is already authorized; run the helper without opening
its bytes. For missing manual credentials, follow secrets-handling intake.

The original filename must be exactly `jali-auth.json`. UTF-8 JSON contains
exactly one nonempty string secret, `cache_key` or `access_token`, and may add
`origin`: the JALA origin the requester signed in to (the widget always sends
it). Both secrets, duplicate fields, other properties and empty values are
invalid.

```sh
python3 scripts/jali.py --event-file <current_event> authenticate --credential-file <attachment_path>
```

Use the exact runtime current event and attachment path. The helper verifies
the original filename, event file reference and session-scoped managed path.
It calls `/api/profile` on the declared `origin`, or on `JALI_JALA_BASE_URL`
when the file declares none, and binds the returned JALA profile ID and that
origin to this contact and thread; the contact ID need not encode the profile
ID. A declared origin must equal `JALI_JALA_BASE_URL` or the configured
`JALI_STAGING_JALA_BASE_URL`; anything else is `origin_not_allowed`. Private
direct messages are required.

`status`, `authenticate` and every later `request` use the thread's stored
origin, and `status` reports it as `origin`. That reported origin is the
thread's environment.

On success it retains the native uploaded bytes and atomically records a
secret-free active pointer in this thread's `.jali/auth-state.json`. Read those
bytes only inside the helper, never using cat, previews, prompts or manual curl.
No global credential JSON is used. Local status is not a live expiry probe.

A later upload in the same conversation is renewal. Select its exact current
file ID, validate first, require the same JALA profile, commit the pointer, then
delete old bytes. Failure removes only the rejected candidate, preserving the
prior binding. Reprocessing an already active file is idempotent. The same
filename across users is safe because the helper binds state to the event's
contact and thread, regardless of transport.

Each request uses its session's active file. A 401 expires that revision; a
403 is a permission denial. Late 401s cannot invalidate a newer replacement.
Another session's authentication is never borrowed. No automatic uncertain-write
retry is allowed. Disconnect marks only this session disconnected and deletes
its active credential bytes. Metadata can remain in native records.

The uploaded JALA credential is distinct from the browser's agent key. The app
handles contact creation and key rotation on login through existing Owner APIs.
