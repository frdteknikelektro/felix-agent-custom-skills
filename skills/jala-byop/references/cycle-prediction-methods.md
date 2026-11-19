# Explain or change a cycle prediction method

Use this case when the requester wants an existing JALA prediction method,
including a move away from BYOP. A custom growth/feed/mortality formula follows
[calculation authoring](calculation-workflow.md) instead. If the request could
mean either operation, explain the distinction and ask one concise question.

## Supported methods and explanations

| Value | Farmer-facing name | Behavior and discussion |
| --- | --- | --- |
| `fr` | Feed Ratio standar | Uses JALA's standard FR model for growth/feed and its normal SR estimation path. Recorded feed and sampling can influence estimates. This is also the backend default for an empty method; send the explicit value `fr`. |
| `stp_fr` | Tabel FR STP | Uses the built-in STP FR/weight model instead of the standard FR model. It can change projected weight, feed, biomass and downstream results. It does not upload a farmer-owned FR table. |
| `fixed` | Fixed | Uses the fixed-SR calculation path, with the cycle's configured target SR and baseline mortality policy. “Fixed” does not mean every output or daily SR is constant, and recorded mortality/harvest remain relevant. |
| `fcr` | Berdasarkan FCR | Infers population/mortality at the cycle's `state.fcr_calculation_age` (default DOC 40), using accumulated feed, modeled weight and `target_fcr` (fallback 1). This inferred-mortality component is zero before/after that age; recorded facts remain relevant. It does not guarantee the measured FCR will equal the target. |
| `ai_cultivation` | Pakan, Sampling, dan Panen | Invokes JALA's cultivation SR prediction service using available cultivation facts, including feed, sampling, harvest, fasting and mortality inputs. The UI calls it Pakan, Sampling, dan Panen. Availability and input sufficiency matter: no generated SR rows can fall back to the fixed-SR path. A saved method alone is not proof the external model produced a prediction. |

For “metode prediksi apa saja yang tersedia di JALA?”, explain all eight
registered methods: the five above plus these three. An informational question
needs no write or mutation approval.

| Value | Farmer-facing name | Explanation and routing |
| --- | --- | --- |
| `custom_fr` | Tabel FR sendiri | Uses a farmer/farm-owned FR table synchronized to the cycle. It differs from `stp_fr` (built-in STP table) and BYOP (custom calculation definition). Switching to or editing this table is outside this five-method switching case; establish table prerequisites and the documented operation before offering it. |
| `ai` | Berdasarkan kualitas air | Uses the water-quality SR prediction service; it is distinct from `ai_cultivation`. This case explains it but does not offer it as a destination method. |
| `byop` | Gunakan prediksi Anda sendiri | Uses an authored calculation definition. Route preview/apply/reset to [calculation authoring](calculation-workflow.md); its apply activates BYOP. Reset removes the selected stored definition without automatically restoring a previous method. |

Support exactly `fr`, `stp_fr`, `fixed`, `fcr`, and `ai_cultivation` as destination values in this switching case. Preserve existing
parameters such as target SR, target FCR, target size and state. Explain those
parameters from the actual cycle; changing one is a separate, explicitly scoped
request, not an implicit part of choosing a method. The label “AI” alone is
ambiguous because JALA also has `ai` (water quality); clarify the intended method.

A method change targets an existing **cycle**, including its current lifecycle
state. It does not change farm/batch defaults or other cycles. Resolve a named
pond to the exact requested cycle; a finished historical cycle must not be
silently substituted for the active cycle. For a multi-cycle request, establish
the exact cycle list and report each result independently; the API is not an
atomic bulk transaction.

## API and transport

Use the existing `jali/scripts/jali.py` helper from the **jali skill folder**,
with the runtime's current event file. It selects this thread's authenticated
origin and credential. For example:

```sh
python3 scripts/jali.py --event-file <current_event> request GET /api/cycles/<cycle_id>
python3 scripts/jali.py --event-file <current_event> request PUT /api/cycles/<cycle_id> --body-file <session_work_dir>/cycle-method.json
```

The non-secret payload contains only the requested setting:

```json
{"survival_rate_prediction_method":"fr"}
```

The five allowed values use the same field and route. This contract is backed
by `jala-web`'s `routes/api.php` cycle resource, `Api/CycleController::update`
and its update rules, and `Cycle::$available_survival_rate_prediction_methods`.
The update authorizes the requester and changes only supplied fields. Respect
live validation/permission failures; do not switch endpoint or environment to
work around a rejection.

Use Jali's normal narrow resource discovery to identify the farm, pond and
cycle. Responses have the helper status envelope and the JALA resource wrapper;
inspect their actual shape before selecting the cycle fields. Never treat an
HTTP/helper success as verification of the requested value.

## Workflow and completion

1. **Read and resolve.** Confirm helper status and origin, then read the exact
   cycle. Record identity, farm/pond, lifecycle state, current method, target SR,
   target FCR, and FCR calculation age when applicable. If already on the
   requested method, report the observed state without an update.
   Completion: exact cycle/current method and relevant parameters are known, or ambiguity blocks the change.
2. **Explain the proposal.** Name the cycle, environment, old/new method and
   relevant behavior from the table. The cycle update clears generated
   prediction, target and actual rows for regeneration; raw sampling, feed,
   harvest and mortality records are not edited by this operation. Moving away
   from BYOP selects the legacy method path while retaining stored custom
   calculation definitions. It is not a calculation reset. Returning via a
   future BYOP apply is a separate operation.
   Completion: the proposal identifies one method transition, scope and regeneration consequences.
3. **Obtain approval for that proposal.** Accept explicit approval in the current
   turn for this exact cycle/method and unchanged consequences. If that approval
   is already present, continue. Otherwise ask one natural-language confirmation.
   Read the cycle again before writing; changed method/relevant parameters or
   scope invalidates the proposal and requires an updated explanation/approval.
   Completion: approval covers the unchanged proposal and fresh cycle state, or no write occurs.
4. **Update once.** Send only `survival_rate_prediction_method` through the helper.
   Use the cycle endpoint, not `PUT /calculation` (which activates BYOP), and do
   not delete stored calculations. On a timeout or unknown outcome, read the
   cycle: desired method means applied; old method means not observed as applied;
   another value/unreadable state is indeterminate. Do not automatically repeat
   a write or roll back; explain unresolved state before any new approved attempt.
   Completion: the single update is accepted, rejected or reconciled as uncertain.
5. **Read back and check results.** Read `GET /api/cycles/<cycle_id>` and require
   exact target identity and requested method. Then read the normal paginated
   `GET /api/cycles/<cycle_id>/cycle_predictions`, `/cycle_targets` and
   `/cycle_actuals` routes to observe generation/results. Use API-returned values;
   do not calculate predictions locally. Check errors, coverage and representative
   weight, SR, biomass and feed values as relevant. Report method persistence and
   result availability separately. Missing/failed series or an unavailable AI
   service means the method can be saved while calculation verification remains
   pending/failed. Do not claim AI execution merely from nonempty series, since
   fallback may have generated them. Do not revert a saved method automatically.
   Completion: exact method readback and a separate result status for each of the three series are recorded.

Completion: report the exact cycle and old/new method from readback, with an
honest status for all three result series. A successful setting change can be
reported as such even when result verification is incomplete, with that limit
stated explicitly. Read and preserve recorded data; never edit result rows.

## Widget replies

Use the method-change branch of [the widget protocol](widget-protocol.md) for
reply format and refresh behavior. Approval comes from the requester's own
message for the exact proposal.

Example: “Untuk Kolam A2, saya akan mengganti Feed Ratio ke metode FCR memakai
parameter FCR dan umur perhitungan yang sekarang. Estimasi akan dihitung ulang.
Terapkan?” After approval, execute and report only the actual readback results.
