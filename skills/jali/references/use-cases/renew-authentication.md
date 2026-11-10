# Renew or disconnect authentication

## Expired access

Example: a farm request returns `authentication_required`.

1. Tell the requester JALA authentication must be renewed; don't show the failed
   token, URL, headers, raw exception or store contents.
2. Follow the authentication reference for a fresh `jali-auth.json` upload from
   the same sender in this thread.
3. The helper verifies the new profile and requires the established identity.
   A changed profile is rejected, not a silent account switch.
4. Successful renewal replaces that user's saved credential. Already-bound
   threads for this same user can use it; unrelated/new threads remain gated.
   The Felix contact and persistent key do not change.
5. Resume a read. For a prior uncertain write, read back before any retry.

cache_key is not an OAuth exchange or refresh token. Use the existing app's
reauthentication to obtain a fresh credential; do not invent a refresh grant.

## Disconnect this thread

Example: “Putuskan akses JALA di percakapan ini.”

```sh
python3 scripts/jali.py --event-file <current_event> disconnect
```

This removes only this thread's binding. It does not revoke the shared Felix
key, clear another thread's authentication or delete another user's records.
Another operation in this thread requires a fresh upload.
