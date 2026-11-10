# BYOP widget operations

Read [calculation workflow](../calculation-workflow.md) before authoring. Use its
farmer interview, freshness, explicit current-turn approval, structural checks
and all-three-series verification. All transport uses this skill's current-event
helper and uploaded credential; no dedicated global BYOP access token or other
account is used. Never run the standalone client's credential intake.

## Transport and authoring state

Read GET /api/calculation_contract first. Resolve farms/cycles through authorized
API data. Read GET /api/{farms|cycles}/{id}/calculation, and cycle contexts at
/api/cycles/{id}/calculation/context. Preview through POST .../calculation/preview
with the live contract's body/query; changes use PUT .../calculation and reset
uses DELETE .../calculation. JALA owns all calculations; never calculate results
locally. Use the live contract to confirm routes/fields and stop if unavailable.

Keep proposal manifests as secret-free JSON in this session's work directory:
proposalId, sourceId, exact target, current source, candidate definition, as_of,
preview evidence, expiry and approval. Generate IDs once and reuse them. A
<byop-action> in the user's message identifies the selected proposal, source,
target and action. Resolve that exact manifest; reject missing, stale or
mismatched proposals. Recheck current source before a write. A matching Apply
button action is approval for that unchanged proposal; other changes need new
approval. Never retry a timed-out mutation automatically.

## Panel output

Use a short farmer-facing reply plus one <byop-panel>JSON</byop-panel> block.
The schema is version 1, strict (no extra keys). Top-level keys are version,
type and data. Types: preview, apply-result, reset-result, error.

The data object contains:
- id, proposalId, sourceId, title, description: nonempty strings.
- target: {scope: farm|cycle, farmId: numeric-string, cycleId?: numeric-string,
  label: nonempty-string}. Match the widget's selected target exactly.
- status: ready|warning|blocked|pending|applied|verified|failed|unknown|discarded.
- timestamp: UTC ISO datetime; expiresAt: UTC ISO datetime for actionable previews.
- metrics: up to 8 {label, baseline, proposal, unit} string objects, from API data.
- impact: {affectedCycles: positive integer, evidence: 1–3 nonempty strings}.
- checks: {prediction, target, actual}, each passed|pending|failed.
- warnings: up to 10 {level: advisory|blocking, message} objects.
- actions: a subset of apply, discard, reset.
- effectiveCalculation?: nonempty string; methodPreserved?: boolean.
- verification?: the proof object described below.

Preview status is ready/warning/blocked/pending/discarded. Apply results use
applied/verified/pending/failed/unknown. Reset results use verified/pending/failed/
unknown. Errors use failed/unknown/blocked. Expose Apply only for a fresh preview
with actual metrics, passing checks and no blocking warnings. A verified reset
requires effectiveCalculation and methodPreserved=true. Never label an admitted
or incomplete write verified.

## Independent readback proof

After a successful write, read back the effective AST and full paginated
prediction, target and actual arrays for every affected cycle. Verify structure,
source and coverage as in the workflow. Then compute SHA-256 hashes using a
Node.js script over the API-returned JSON: recursively sort object keys, preserve
array order, compact JSON with literal UTF-8 (no ASCII escaping). This is data
comparison, not a local calculation engine.

Include verification: {definitionHash: hash-of-effective-ast, cycles: [{id,
predictionHash: hash-of-all-prediction-rows, targetHash: hash-of-all-target-rows,
actualHash: hash-of-all-actual-rows}]}. Cover every affected cycle; use only
real nonempty arrays, never invent evidence. The widget backend independently
reads the API and checks these hashes before notifying the host. If complete
proof is unavailable, use pending/unknown and explain the missing verification.
