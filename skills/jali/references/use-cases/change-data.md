# Change JALA data

Examples: change a profile field, record feeding, or correct a cycle entry.

1. Authenticate the current thread. Resolve the requested resource from JALA;
   do not use another conversation's IDs or infer an ID from a display name.
2. Establish the existing documented route, HTTP method, required fields and
   values for the requested operation. If that contract is unavailable, ask
   for the documentation/clarification instead of inventing an endpoint.
3. Put only the operation's non-secret JSON body in this Session's work folder.
   For a profile update, for example, use the documented PUT /api/profile shape:

```sh
python3 scripts/jali.py --event-file <current_event> request PUT /api/profile --body-file <payload_path>
```

The helper attaches authentication internally. It rejects credential fields,
credential-issuing routes and arbitrary target hosts.
4. Execute the user's authorized request under JALA's existing policies. Follow
   existing approval requirements where applicable; this skill invents no new
   JALA business policy. For a destructive or ambiguous request, establish its
   exact target and consequence before executing.
5. Verify the effective state through the corresponding read route. A timeout
   or transport failure after submission is uncertain: read back before retrying
   and do not automatically resubmit an unknown-outcome write.

Completion: the requested state is read back and reported, or the uncertain,
rejected or incomplete outcome is explicit. No secret values appear in the reply.
