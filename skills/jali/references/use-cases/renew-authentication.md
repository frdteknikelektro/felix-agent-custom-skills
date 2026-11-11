# Renew or disconnect this session

A new jali-auth.json may arrive at any time in an existing chat, including a
switch between cache_key and OAuth for the same account. Follow
[authentication](../authentication.md): select the exact current file, validate
it, replace the pointer atomically and remove superseded bytes. Failed renewal
keeps the prior binding. No timestamp-based file selection is allowed.

On authentication_required, request app reauthentication/new upload. cache_key
is not an OAuth refresh grant. Resume reads after renewal; reconcile uncertain
writes before any retry. Other sessions and the agent key are unchanged.

```sh
python3 scripts/jali.py --event-file <current_event> disconnect
```

Disconnect affects only the current session and its active file.
