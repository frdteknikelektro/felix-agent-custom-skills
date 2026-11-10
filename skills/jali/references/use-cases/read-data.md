# Read JALA data

Example: “Tampilkan tambak saya.”

1. Run `status` for the exact current event. Authenticate when required.
2. Use a documented endpoint:

```sh
python3 scripts/jali.py --event-file <current_event> request GET /api/farms
```

A profile lookup uses `GET /api/profile`. For filters, create a non-secret JSON
object in this Session's work directory and pass `--query-file <path>`. Never
include authentication fields or place query text in the route argument.
3. Resolve the requested farm/pond/cycle from the API's actual response before
   reading its data. Ask when names match multiple records. Paginate supported
   list routes rather than treating the first page as a complete account list.
4. Report actual values and the selected scope. `authentication_required` starts
   renewal; `permission_denied` is a rejected action, not a request to borrow a
   different user's credential.

Completion: the requested data was read for this authenticated user, with
pagination/ambiguity stated, or the safe error and next step are reported.
