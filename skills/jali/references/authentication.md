# Thread authentication and file contract

## Upload

Original filename: **jali-auth.json** (case-sensitive). UTF-8 JSON object with
exactly one non-empty string property, either:

```json
{"cache_key":""}
```

or:

```json
{"access_token":""}
```

The empty value is a blank template; the requester fills it locally. Do not
include both fields, user IDs, passwords, URLs or extra metadata. The user's ID
comes exclusively from JALA `/api/profile`. Never ask for a credential pasted
in chat. Do not resend the filled file.

For missing credentials, follow the `secrets-handling` skill and its intake
reference. After the requester's consent, deliver a blank template for their
chosen credential type; the supplied cache-key template is
`assets/jali-auth.json`. Use the runtime's current sender/conversation/upload
metadata to associate an upload with the authorized thread. An unrelated upload
or another sender's file does not satisfy this request. If several current
attachments are named jali-auth.json, ask which one to use before consumption.

## Consumption

Run only the helper, passing the selected attachment path, not its contents:

```sh
python3 scripts/jali.py --event-file <current_event> authenticate --credential-file <attachment_path>
```

The helper checks the attachment's original filename and path in the current
event, validates its strict schema, then calls `https://app.jala.tech/api/profile`
with the selected credential. cache_key is sent as a query parameter; an access
token uses Bearer. It never sends both or follows redirects.

A verified profile yields `jala-<id>`. If the Felix API contact is named
`jala-<id>`, it must match. The first successful authentication binds the
runtime sender to that JALA identity; a later thread cannot switch that sender
to another account. The helper saves the private JSON record and current
thread mapping, then deletes only the consumed credential attachment. Cleanup
cannot remove provider-held upload copies. It returns a safe status/user ID,
not the credential. Failed validation leaves dependent work paused.

Private JSON example below is **structure only**, never an instruction to read it:

```json
{
  "version":1,
  "users":{"jala-123":{"credential":{"cache_key":"<private>"},"revision":"<opaque>","profile":{"id":"123","name":"Farid"}}},
  "senders":{"<source-and-sender>":"jala-123"},
  "threads":{"<sender-and-thread>":{"user":"jala-123"}}
}
```

The store path is outside the model's normal Workspace. It remains accessible
to code under the shared account; the skill's instruction boundary prevents
ordinary model-visible reads, not malicious unrestricted execution.

## API credentials versus Felix access

The uploaded credential authorizes **JALA REST requests**. It is not a Felix
API key and cannot authenticate a browser to Felix. The app/Owner separately
creates the contact and its persistent Felix key using the existing Owner API.
New threads and renewed JALA uploads keep that contact/key unchanged.
