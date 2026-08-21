# Jala BYOP Calculation Workflow

Read this reference for every Jala BYOP request. It is the complete farmer-facing authoring, preview, approval, mutation, reconciliation, and verification contract.

Use the following workflow for every request.

Use this standalone skill to change or verify a JALA calculation without local
repository, database, PHP, or calculation-runtime access. JALA owns data,
calculation, validation, persistence, cleanup, normal generation, and result
rows. The calling agent owns the interview, decision ledger, candidate loop,
approval state, and user communication.

The API is the only runtime and data source. The client may normalize responses,
compare returned evidence, and maintain authoring state; it never calculates
prediction, target, actual, growth, feeding, mortality, fallback, or finance
values locally.

## Farmer-facing conversation contract

The requester is a farmer or farm operator, not a developer. Start in the
user's language and translate the request into a calculation rule yourself.
User-facing messages use farmer vocabulary such as “petambak,” “tambak,”
“kolam,” “siklus tebaran,” “survival,” “bobot,” “pakan,” “mortality,” “panen,”
“preview,” and “terapkan.” Keep implementation vocabulary in internal notes;
use it in user messages only when technical detail or a handoff requires it.

- A name or natural-language description is a valid starting target. Do not
  require a URL or numeric ID when the user knows only a tambak or kolam name.
- Search facts yourself through narrow authorized routes. If exactly one target
  matches, state the resolved tambak/kolam and continue. If none or multiple
  match, ask for one simple identifying clue; never make the user enumerate
  resources or decode an API error.
- “Tambak” can mean the whole farm or colloquially a specific kolam. A specific
  kolam name such as A1 is evidence for kolam scope, but ask one plain question
  when the wording could mean either the whole tambak or that kolam.
- Ask at most one concise, high-value question per turn, and only after reading
  facts that can be discovered without the user. Never ask the user to choose an
  implementation operator or write a request body.
- Keep a decision ledger and do not reopen settled decisions. Interview
  agreement is not mutation approval; a clear natural-language approval such as
  “oke,” “lanjut,” “coba,” “terapkan,” or “apply” is sufficient when the current
  scope and preview are unchanged.
- Before mutation, summarize the rule, before/after proof, important downstream
  effects, evidence tambak/kolam, and lifecycle consequence in plain language.
  Ask for explicit approval in the current turn, but never require an exact
  approval phrase.

Accept downstream changes when the fresh context and preview explain them.
Treat rounding differences and host-owned finance enrichment as warnings when
structural, null, and source checks pass. Stop for an ambiguous target, failed
or incomplete calculation, invalid actual facts or required observation
behavior, identity mismatch, or an unexplained impact.

When a technical blocker persists, explain it in one short farmer-facing
sentence, say that the change was not applied, and prepare a sanitized handoff
note for the JALA technical agent when an output location is available. Never
include credentials in the handoff.

### Freshness gate

Bind every baseline, candidate, approval, mutation, and verification to the
same target, scope, evidence sample, effective time, and current source. A
change to any of these, or to the candidate definition, invalidates the
approval and requires a fresh baseline or preview before mutation.

## Boundary and setup

Read credentials only from the process environment:

```text
JALA_BYOP_API_BASE_URL=https://<host>/api
JALA_BYOP_ACCESS_TOKEN=<dedicated-user-access-token>
```

Require an absolute HTTP(S) base URL whose path ends in `/api`. Send the token
only as an `Authorization: Bearer` header. Keep it out of arguments, files,
prompts, diagnostics, logs, and output. Use the backend's 30-second request
timeout. The client is dependency-free Python and uses only the standard
library.

Use `scripts/client.py` for transport, target resolution, pagination, contract
and context reads, baseline/candidate previews, approval state, timeout
reconciliation, mutation limits, farm sample confirmation, and structural
verification. The client has no server session and no calculation engine.

## Calculation contract

These rules are part of this standalone skill; follow them directly during
remote authoring.

### Scope and precedence

- `cycle` scope changes one selected cycle.
- `farm` scope changes the farm-owned calculation used by cycles that do not own
  a cycle calculation.
- Farm calculations affect BYOP cycles only; they never switch a non-BYOP cycle's
  calculation method.
- Effective precedence is `cycle calculation → farm calculation → Reference
  calculation definition`.
- A cycle calculation remains effective for that cycle after a farm change.
- The maintained Reference calculation definition is immutable through this
  authoring surface.
- A non-BYOP cycle may be previewed hypothetically. Apply and reset must fail
  closed and must never switch the cycle's calculation method.

### Modes and responsibilities

The complete calculation produces prediction, target, and actual series.

- `weight` changes the weight trajectory and may affect size, biomass, ADG,
  feed, FCR, harvest weight, price, revenue, and finance outputs.
- `feeding_rate` changes planned feed when no explicit `feed` responsibility is
  supplied. Prediction and target use planned/displayed feed; actual mode uses
  recorded feed for displayed actual feed.
- Prediction may use recorded feed for historical accumulation and planned feed
  when recorded feed is absent. Actual mode keeps missing recorded feed null and
  contributes zero to actual feed accumulation.
- Recorded sampling, harvest, mortality, fasting, treatment, and price events
  remain system-owned facts. Actual observations remain authoritative.
- Missing observed weight, harvest, price, revenue, and profit remain null when
  the actual output contract requires an observation.
- Actual rows use host-owned actual finance enrichment. A candidate must satisfy
  finance and output contracts without trying to author host-owned finance fields.
- `mortality_candidate` changes inferred mortality only. It does not rewrite
  recorded mortality or actual mortality accumulation. Population and survival
  guards still apply.
- `age`, `date`, `actual_mortality`, and
  `actual_mortality_accumulation` are system-owned. Finance fields are
  host-enriched and are not calculation inputs.

An anchor correction must produce a coherent full trajectory. Inspect survival,
live tails, inferred and actual mortality, mortality accumulation, harvest
subtraction and accumulation, feed, growth, price/revenue, FCR, cost, and
finance consequences rather than changing a displayed field alone.

### Candidate shape

The API accepts a compact definition or a complete validated definition. The
compact form is:

```json
{
  "base": "fr",
  "overrides": {
    "weight": {"type": "..."},
    "feeding_rate": {"type": "..."},
    "feed": {"type": "..."},
    "mortality_candidate": {"type": "..."}
  }
}
```

`base: "fr"` means the immutable Reference calculation definition used as the
fallback base. It is not a user-editable calculation.

Use the live contract to determine supported expression types, fields, null
behavior, node limits, depth limits, JSON-size limits, and runtime identity.
JALA compiles and validates the candidate. The client never evaluates it.

## Authoring workflow

### 0. Preflight and decision ledger

Before the first substantive question, check local environment configuration only
and prepare the API reads needed after the target is known. When a target is
already supplied, perform a bounded read-only preflight: resolve the target, read
the live contract, and read the current effective calculation. Select
scope-specific evidence cycles only after the interview settles the scope. When
no target is supplied, ask only for the tambak or kolam name (or a narrow
identifying description); an identifier or URL is optional. Then perform this
common preflight before asking the next question.

Prepare a brief containing target identity, scope candidates, current method and
source, precedence, relevant parameters and facts, intended responsibility,
approval consequences, and verification anchors. Do not start candidate
authoring while a decision that can change scope, responsibility, or mutation is
unresolved.

Completion criterion: exactly one authorized target is identified; the live
contract and current effective source are recorded; unresolved ledger items are
explicit; and no candidate authoring has begun.

### 1. Interview the request

Resolve these decisions in order, asking only one unresolved question per turn:

1. **Responsibility.** Is this a maintained calculation-rule change or an
   explanation of one observed output? Ask this only when the request is
   genuinely ambiguous. Never patch a persisted result row.
2. **Behavior.** What domain behavior should change? Translate requests such as
   “increase survival by 10%” into the smallest supported underlying transition.
   Resolve relative percentages versus percentage points and age/day versus
   calendar-date anchors.
3. **Scope.** Is the rule for the whole tambak or one kolam/siklus tebaran?
   A URL never decides scope. If “tambak” is being used colloquially for a
   kolam, ask the one simple scope question before mutation.
4. **Existing behavior.** Should the current custom calculation be preserved,
   replaced from the Reference calculation definition, or reset to it? Preserve
   unrelated custom responsibilities by default.
5. **Proof.** What before/after behavior, date, or age proves the request? Capture
   one measurable anchor, neighboring rows, final/live-tail behavior, and fields
   that must change or remain unchanged.
6. **Time.** If historical feed or another time-sensitive fact matters, obtain
   an explicit timezone-aware `as_of`. Otherwise one server-selected instant may
   be accepted and then reused unchanged for the entire iteration.

Completion criterion: responsibility, behavior, scope, existing-behavior choice,
proof anchor, and effective-time policy are settled in the ledger.

### 2. Resolve the target and current source

Prefer an exact authorized ID or URL when one is supplied, but do not require
one. For a farmer-facing request, resolve a narrow name or description first,
then show the resolved tambak/kolam name and ID in a short confirmation. Stop on
zero or multiple matches and ask for one identifying clue; do not enumerate all
farms, ponds, or batches to guess.

The client supports these equivalent forms:

```text
python client.py resolve_target cycle 123
python client.py resolve_target farm https://host/api/farms/7
cat narrow-farm-search.json | python client.py resolve_target farm --search
```

When needed, discover cycles progressively through the existing routes:

```text
GET /api/farms/{farm_id}/cycles
GET /api/farms/{farm_id}/ponds
GET /api/farms/{farm_id}/batches
GET /api/batches/{batch_id}/cycles
```

Read the current effective calculation and record its source, runtime version,
definition identity, method, and effective precedence. For a cycle, use the safe
calculation context to obtain cycle, pond, farm, parameter, event, date, and
timezone facts. For a farm, select and confirm one to three representative real
cycles. Farm evidence cycles must inherit the farm/reference calculation; a
cycle-owned calculation cannot represent farm behavior.

Use only a BYOP cycle for a persisted mutation. A non-BYOP cycle may be used for
read-only hypothetical preview, but the original method remains unchanged.

Completion criterion: exactly one authorized farm or cycle, its method, scope,
effective source, relevant facts, and any representative cycles are recorded
without ambiguity.

### 3. Freeze context and read the live contract

Call `GET /api/calculation/contract` before the first candidate. Follow the live
AST schema, runtime, output fields, null behavior, and limits.

Choose one timezone-aware `as_of` for the iteration. Prefer the user-provided
value when time-sensitive facts matter; otherwise use the first server-returned
value from context or baseline preview. Reuse the exact normalized instant for
all selected contexts, baseline preview, candidate previews, comparisons, and
verification.

Read contexts for every selected evidence cycle through:

```text
GET /api/cycles/{cycle_id}/calculation/context?as_of=<as_of>
```

Treat the returned context as the only authoring input. Never invent facts from
local assumptions or copied schemas.

Completion criterion: one frozen effective time, the live contract, and a safe
context for every selected evidence cycle are available and tied to the same
iteration.

### 4. Preview the current calculation

Always preview current effective behavior before a candidate. Use the current
effective definition returned by JALA and inspect prediction, target, and actual
series. Preview is read-only and changes no stored definition or generated row.

Use:

```text
POST /api/cycles/{cycle_id}/calculation/preview
POST /api/farms/{farm_id}/calculation/preview
```

Farm preview must contain only the confirmed representative cycle IDs and no
more than three. If no suitable real cycle exists, stop farm behavioral approval;
an optional synthetic/default smoke result is not evidence.

Compare the baseline around the requested anchor, neighboring rows, final row,
and live-tail clamp. Include relevant survival, mortality, population, harvest,
feed, growth, size, ADG, FCR, price, revenue, cost, finance, and null behavior.

Completion criterion: the current source and all three baseline series have been
read at the frozen effective time, with the requested anchor and downstream
effects understood well enough to state the before/after proof.

### 5. Author and iterate candidates

Write the proposed calculation rule in domain language first, then encode it as
the smallest supported compact definition or complete definition. JALA must
compile and preview every candidate. Never calculate expected prediction,
target, or actual values in the client.

For a candidate to be usable, prediction, target, and actual must succeed for
every selected cycle. Present the user with a concise domain summary: tambak or
kolam scope, rule, one anchor comparison, important downstream differences,
warnings, and series status. Do not expose implementation identity or internal
field/null details unless needed to explain a concrete failure. Expected
downstream changes may be accepted when the fresh context and preview explain
them; do not reject a candidate merely because feed, weight, FCR, harvest, or
finance consequences move.
Keep definition hashes and other implementation identity internal; disclose them
only when explaining stale state, timeout reconciliation, or a technical request.

The authoring loop is unlimited. Apply the freshness gate before mutation. A
warning starts a read-only context refresh and candidate re-preview; it never
adjusts the candidate automatically.

Completion criterion: every selected cycle has a successful candidate preview;
the domain behavior, all three series, downstream effects, and warnings are
understood well enough for approval; or the candidate is rejected with an
actionable failure.

### 6. Obtain explicit approval

Before mutation, show the tambak/kolam scope, selected evidence cycle(s),
plain-language rule, before/after proof, important downstream effects, and
lifecycle consequence. Use “terapkan” in user-facing text; keep the technical
scope names internal.

Ask for explicit approval in the current user turn. A successful preview,
earlier conversation, or confident wording is not approval. Accept a clear
natural-language affirmative; do not require the exact word “approve.”

Applying or resetting a farm calculation clears affected generated rows for
unfinished BYOP cycles in that farm. Applying or resetting a cycle calculation
clears affected generated rows for that cycle. Normal result generation rebuilds
cleared rows, and cycle calculations outrank farm calculations.

Completion criterion: the user explicitly approves one action and its scope in
the current turn; otherwise return the preview and stop without mutation.

### 7. Apply, reset, and reconcile

Use only the approved mutation through the existing API:

```text
PUT    /api/cycles/{id}/calculation
PUT    /api/farms/{id}/calculation
DELETE /api/cycles/{id}/calculation
DELETE /api/farms/{id}/calculation
```

JALA owns cleanup. The client does not edit result rows, create cleanup tables,
or call undocumented cleanup endpoints. Farm mutation is farm-wide; normal
regeneration and verification remain limited to the explicitly approved evidence
cycles while other affected cycles remain cleared until requested normally.

Keep processing synchronous and use the client's bounded mutation-attempt limit.
If a mutation times out, re-read current effective state before any retry:

- desired definition identity present → `applied`; verify, do not retry;
- previous identity or Reference calculation identity present → `not_applied`;
- any other or unreadable state → `indeterminate`, block and ask for intervention.

Only `not_applied` permits one fresh approval-gated retry within the client limit.
Never automatically roll back or adjust the candidate.

Completion criterion: the approved mutation is either reconciled as applied,
reconciled as safely not applied, or explicitly blocked as indeterminate.

### 8. Verify the applied or reset result

Re-read effective scope, source, runtime, and definition identity. For reset, use
the returned Reference calculation definition to create the read-only verification
preview. Fetch all three existing result routes for every approved cycle:

```text
GET /api/cycles/{cycle_id}/cycle_predictions
GET /api/cycles/{cycle_id}/cycle_targets
GET /api/cycles/{cycle_id}/cycle_actuals
```

Hard checks are successful generation, complete row count, contiguous age/date
coverage, ordering, required fields, null behavior, and source/runtime identity.
Inspect the first, middle, and last rows plus the requested anchor. Include
downstream survival, inferred and recorded mortality, live tails, harvest and
mortality accumulation, feed, weight/size, ADG, FCR, price/revenue, cost, and
finance fields when affected.

Actual-specific checks preserve recorded observations and required nulls. A
non-BYOP result remains on its original path. For FR actual parity, exact
null-aware parity requires a server-supported legacy/reference comparison at the
same explicit `as_of`; if the API does not expose that oracle, report parity as
unavailable rather than claiming equivalence from persisted rows or structural
similarity.

Classify results per cycle and series:

- `passed`: hard checks pass and no representative drift exists;
- `passed_with_warnings`: hard checks pass, live-data values differ, and a fresh
  context plus candidate preview explains the generated rows;
- `failed`: identity mismatch, generation error, missing series, malformed rows,
  missing fields/null behavior, incomplete coverage, or unexplained drift.

If a warning recheck matches generated rows, record confirmed live-data drift.
Treat storage rounding and host-owned finance enrichment as explained warnings
when coverage, null behavior, source identity, and calculation fields pass. If
the remaining drift is not explained by fresh context, rounding, or host-owned
enrichment, stop with an unexplained verification failure. Preserve an applied
mutation after verification failure; rollback or a new candidate is a new
explicitly approved mutation.

Completion criterion: every approved cycle and all three series have a passed,
passed-with-warnings, or failed status with concrete evidence and diagnostics.

### Farmer-facing completion and blockers

On success, lead with a short result that names the object and ID, for example:

> Berhasil. Tambak JALAKARA PRIMA SEGARA (10465) sekarang membatasi SR
> maksimum 100%. Bukti sudah dicek di Kolam A1 (39152).

Mention only the most important warning or downstream effect after that result.
Do not surface `null`, BYOP, hashes, runtime identities, or endpoint names in a
normal farmer-facing completion.

On a blocker, say what was not applied and why in plain language, then prepare a
sanitized handoff note for the technical agent when possible. The handoff may
contain target IDs, frozen time, safe preview evidence, diagnostics, and
acceptance criteria, but never credentials or authorization headers.

## Canonical client sequence

Use the in-process Python loop when the host agent must retain interview,
candidate, approval, and mutation state. The shell CLI is intentionally limited
to read, resolve, context, preview, series, and verification operations; it has
no apply or reset command.

```python
from client import AuthoringLoop, RemoteCalculationClient

client = RemoteCalculationClient.from_environment()
loop = AuthoringLoop(client)
loop.set_target(scope, target_id, as_of=as_of)

# For farm scope, confirmed_cycles are real cycle objects selected through the
# narrow farm discovery flow. Do this only after farm scope is settled.
if scope == "farm":
    loop.set_confirmed_sample(confirmed_cycles)

baseline = loop.read_baseline()
candidate_preview = loop.preview_candidate(definition)

# Run this only after explicit approval in the current user turn.
loop.approve("apply")
mutation = loop.apply()
verification = loop.verify()
```

For reset, read the baseline, obtain explicit approval, then call
`loop.approve("reset")`, `loop.reset()`, and `loop.verify()`. If the candidate,
scope, sample, effective time, or baseline changes, preview again and obtain
fresh approval before mutation.

## API operations

The dependency-free client exposes these operations:

```text
contract
resolve_target <farm|cycle> <id-or-url>
resolve_target <farm|cycle> --search < narrow-filters.json
farms / farm_cycles / farm_ponds / farm_batches / batch_cycles
current <farm|cycle> <id>
context <cycle_id> [--as-of ISO-8601]
baseline preview through AuthoringLoop.read_baseline()
preview <farm|cycle> <id> [--cycle-id ID ...] [--as-of ISO-8601] < candidate.json
series <cycle_id> <prediction|target|actual>
verify <farm|cycle> <id> [--cycle-id ID ...] < evidence.json
```

For farm CLI preview input, wrap the candidate definition with confirmed sample
objects. The sample objects must come from the narrow farm discovery flow:

```json
{
  "definition": {"base": "fr", "overrides": {}},
  "samples": [
    {
      "id": 123,
      "confirmed": true,
      "is_real": true,
      "sample_role": "recent_unfinished_inheriting"
    }
  ]
}
```

Example commands:

```text
python client.py preview farm 7 --cycle-id 123 < farm-preview.json
python client.py verify farm 7 --cycle-id 123 < farm-verification.json
```

Verification uses a separate evidence object. `expected` is the effective
identity returned by the approved mutation, `preview` is the complete candidate
or reset preview returned by JALA, and `definition` is the definition used for
warning rechecks when available:

```json
{
  "expected": {
    "scope": "farm",
    "source": "farm",
    "runtime_version": "<returned-runtime-version>",
    "definition_hash": "<returned-definition-hash>"
  },
  "preview": "<complete-preview-response-returned-by-jala>",
  "definition": {"base": "fr", "overrides": {}},
  "as_of": "<frozen-timezone-aware-instant>",
  "samples": [
    {
      "id": 123,
      "confirmed": true,
      "is_real": true,
      "sample_role": "recent_unfinished_inheriting"
    }
  ]
}
```

Use `RemoteCalculationClient`, `AuthoringLoop`, `verify_applied`, and
`verify_series` when the host agent needs to retain the interview and approval
ledger. Low-level mutation methods are not shell operations; call them only
through the approval-gated loop.

## Safety and stop conditions

- Use the dedicated user access token and normal parent farm/cycle authorization.
- Keep API errors concise and safe; never print raw response bodies or headers.
- Keep authoring iterations unlimited but mutation attempts bounded and approval-gated.
- Keep JALA stateless: no server session, transcript, candidate history, rollback
  table, calculation-history table, or local calculation engine.
- Keep the maintained Reference calculation definition immutable through this API.
- Keep non-BYOP methods on their original path.
- Stop on ambiguous targets, missing farm evidence, unsupported candidate
  responsibility, stale source identity, indeterminate timeout state, malformed
  output, incomplete coverage, or unexplained warning drift.

The authoring effort may continue after a failed candidate, warning, or diagnostic.
It ends only when the user stops, explicitly applies or resets with verification,
or a blocker requires user or server intervention.


## Checks

- Confirm the selected target is authorized and unambiguous before authoring.
- Keep the frozen effective time, evidence sample, current source, candidate, approval, mutation, and verification bound to one freshness context.
- Keep credentials in JALA_BYOP_API_BASE_URL and JALA_BYOP_ACCESS_TOKEN; never print or persist them.
- Keep calculation, cleanup, normal generation, and result-row ownership on the JALA API.
- Verify all approved cycles and prediction, target, and actual series before reporting success.

