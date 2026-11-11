# BYOP widget protocol

Read this for every turn that arrives from the BYOP widget. The widget renders
the reply's text, one optional `<byop-panel>` and one optional `<byop-prompts>`
block; everything else about authoring follows the
[calculation workflow](calculation-workflow.md): farmer interview, freshness,
explicit current-turn approval, structural checks and all-three-series
verification. All API calls go through `scripts/client.py --event-file
<current_event>`, which uses this thread's uploaded credential.

## Proposal manifests and actions

Read `GET /api/calculation_contract` first and confirm routes and fields from
it; stop if it is unavailable. Keep one secret-free JSON proposal manifest per
proposal in this session's work directory: proposalId, sourceId, exact target,
current source, candidate definition, as_of, preview evidence, expiry and
approval. Generate IDs once and reuse them.

A `<byop-action>` in the user's message names the selected proposal, source,
target and action. Resolve that exact manifest; reject a missing, stale or
mismatched proposal. Recheck the current source before a write. A matching
Apply action is approval for that unchanged proposal; any other change needs
new approval. Reconcile a timed-out mutation by readback before any retry.

## Panel output

Use a short farmer-facing reply plus one `<byop-panel>JSON</byop-panel>` block.
The schema is version 1 and strict (no extra keys). Top-level keys are
`version`, `type` and `data`. Types: `preview`, `apply-result`, `reset-result`,
`error`.

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
applied/verified/pending/failed/unknown. Reset results use
verified/pending/failed/unknown. Errors use failed/unknown/blocked. Offer Apply
only for a fresh preview with actual metrics, passing checks and no blocking
warnings. A verified reset requires effectiveCalculation and
methodPreserved=true. Label a write verified only after complete readback proof.

## Independent readback proof

After a successful write, read back the effective AST and the full paginated
prediction, target and actual arrays for every affected cycle. Verify structure,
source and coverage as in the workflow. Then compute SHA-256 hashes with a
Node.js script over the API-returned JSON: recursively sort object keys,
preserve array order, compact JSON with literal UTF-8 (no ASCII escaping). This
is data comparison, not a calculation engine.

Include verification: {definitionHash: hash-of-effective-ast, cycles: [{id,
predictionHash: hash-of-all-prediction-rows, targetHash: hash-of-all-target-rows,
actualHash: hash-of-all-actual-rows}]}. Cover every affected cycle with real
nonempty arrays. The widget backend reads the API itself and checks these
hashes before notifying the host. When complete proof is unavailable, use
pending/unknown and explain the missing verification.

## Render errors

The widget validates every `<byop-panel>` and `<byop-prompts>` block it
receives and tells you when one fails, in one of two hidden forms. Neither is
from the farmer, so the reply never mentions it.

- A turn that starts with `[[jali-internal:render-error:<id>:<message id>]]`
  names the reason your previous reply's `<byop-panel>` could not be displayed.
  Reply with that whole reply again: the same farmer-facing text, the same
  proposal and source IDs, and a corrected panel built from the evidence you
  already gathered. Make no new API calls or writes in this turn. The widget
  shows your answer in place of the broken reply and asks only once.
- A user message that starts with a `[[jala-byop-render-note]] …
  [[/jala-byop-render-note]]` block carries a note about your previous reply, such
  as prompt choices that were not shown and why. Answer the farmer's message
  after the block as usual, and apply the note to this and later replies.

## Prompt choices

End a reply with one `<byop-prompts>` block when the farmer has a few clear next
steps, such as choosing between candidate rules, comparing methods, or moving
from a preview to a decision. The widget shows each option as a button; a tap
fills the farmer's message box with that option's prompt, ready to edit and
send.

```text
<byop-prompts>{"version":1,"options":[{"label":"Bandingkan metode","prompt":"Bandingkan metode prediksi untuk Kolam A1 dan rekomendasikan yang paling sesuai."}]}</byop-prompts>
```

- The block is the last thing in the reply, outside any code fence, with valid
  JSON on one line.
- `version` is 1; `options` holds 1–4 objects with exactly `label` and `prompt`.
- `label` is 1–64 characters: a short action in the farmer's language.
- `prompt` is 1–2000 characters, written as the farmer's own next message, in
  their language, naming the target it concerns.
- Each option is a distinct next step that this skill can carry out. The reply
  text stays complete on its own; the buttons add shortcuts, not new content.
- Approval comes only from the farmer's own message or a panel action, so an
  option prompt asks for a preview or explanation rather than an apply or
  reset.
