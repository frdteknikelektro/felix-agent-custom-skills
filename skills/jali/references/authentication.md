# Session authentication and renewal

The widget uploads `jali-auth.json` automatically. For a supplied credential
attachment, collection is already authorized; run the helper without opening
its bytes. For missing manual credentials, follow secrets-handling intake.

The original filename must be exactly `jali-auth.json`. UTF-8 JSON contains
exactly one nonempty string property: `cache_key` or `access_token`. Both fields,
duplicate fields, extra properties and empty values are invalid.

```sh
python3 scripts/jali.py --event-file <current_event> authenticate --credential-file <attachment_path>
```

Use the exact runtime current event and attachment path. The helper verifies
its file ID, original filename and native metadata under this thread's
attachments/api-inputs directory. It calls /api/profile on JALI_JALA_BASE_URL,
requiring the profile's `jala-<id>` to equal the API contact.

On success it retains the native uploaded bytes and atomically records a
secret-free active pointer in this thread's `.jali/auth-state.json`. Read those
bytes only inside the helper, never using cat, previews, prompts or manual curl.
No global credential JSON is used. Local status is not a live expiry probe.

A later upload in the same conversation is renewal. Select its exact current
file ID, validate first, commit the pointer, then delete old bytes. Failure
removes only the rejected candidate, preserving the prior binding. Reprocessing
an already active file is idempotent. The same filename across users is safe
because resolution is constrained to the event's own session.

Each request uses its session's active file. A 401 expires that revision; a
403 is a permission denial. Late 401s cannot invalidate a newer replacement.
Another session's authentication is never borrowed. No automatic uncertain-write
retry is allowed. Disconnect marks only this session disconnected and deletes
its active credential bytes. Metadata can remain in native records.

The uploaded JALA credential is distinct from the browser's Felix key. The app
handles contact creation and key rotation on login through existing Owner APIs.
