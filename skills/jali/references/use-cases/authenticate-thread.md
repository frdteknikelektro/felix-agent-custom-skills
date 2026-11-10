# Authenticate a new thread

Example: a new chat asks, “Tampilkan tambak saya.”

1. Run the current event's `status`. Do not reuse another thread's authenticated
   status, even when the sender has a saved user record.
2. If authentication is missing, explain that JALA access requires the
   requester's `jali-auth.json` file. Follow the authentication reference and
   secrets-handling collection workflow; send only a blank template.
3. On the authorized upload, run `authenticate` against that current event and
   attachment. Never load its contents into model context.
4. `authenticated`: acknowledge without repeating values and resume the pending
   farm read. `identity_mismatch` or `authentication_required`: explain the safe
   result and request the correct account/file. A store/transport error is not
   evidence of a wrong credential.

Completion: the thread has its own verified binding and consumed-upload cleanup,
or the exact remaining authentication/setup step is stated. No Felix key changes.
