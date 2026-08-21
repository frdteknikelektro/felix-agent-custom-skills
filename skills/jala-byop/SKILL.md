---
name: jala-byop
description: Use when a farmer or Jala operator needs to author, preview, apply, reset, or verify a JALA Bring Your Own Prediction calculation through the stateless farm- or cycle-scoped API.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: calculation.read, calculation.write
  match: jala byop, bring your own prediction, jala prediction, jala calculation, jala target, jala actual, jala feeding rate, jala mortality, jala FR, jala farm calculation, jala cycle calculation
env:
  - key: JALA_BYOP_API_BASE_URL
    description: Absolute JALA API base URL whose path ends in /api
    required: true
    secret: false
  - key: JALA_BYOP_ACCESS_TOKEN
    description: Dedicated JALA access token for BYOP calculation authoring
    required: true
    secret: true
---

# Jala BYOP (Bring Your Own Prediction)

## Purpose

Author, preview, apply, reset, and verify JALA farm- or cycle-scoped Bring Your Own Prediction calculations through the stateless API. JALA owns calculation, validation, persistence, cleanup, normal generation, and result rows; this skill owns the farmer-facing interview, decision ledger, candidate loop, approval state, and communication.

## When to use

Use when a farmer or Jala operator asks to change, preview, apply, reset, or verify a JALA prediction, target, actual, growth, feeding, mortality, FR, farm-scoped, or cycle-scoped calculation.

## Out of scope

- Local calculation engines, databases, PHP runtimes, or direct result-row editing
- Undocumented JALA endpoints or mutation paths
- Non-JALA calculation systems

## Permissions

Request the bare permission shown below; Felix stores grants under this skill ID.

- `calculation.read` — resolve targets, read contracts and contexts, preview candidates, inspect series, and verify results.
- `calculation.write` — apply or reset a calculation after the current-turn approval gate succeeds.

Preview, baseline reads, and verification are read-only. Apply and reset always require explicit user approval in the current turn.

## Workflow

1. Read [the complete Jala BYOP calculation workflow](references/calculation-workflow.md) before acting.
2. Read credentials only from `JALA_BYOP_API_BASE_URL` and `JALA_BYOP_ACCESS_TOKEN`; never print, persist, or pass them in arguments.
3. Use the bundled [dependency-free client](scripts/client.py) for transport, target resolution, live-contract reads, contexts, previews, series, mutation approval state, timeout reconciliation, and structural verification.
4. Keep the API as the only calculation and data source. Never calculate prediction, target, actual, growth, feeding, mortality, fallback, finance, or expected result values locally.
5. Treat every baseline, candidate, approval, mutation, and verification as one freshness-gated iteration. Stop on ambiguity, failed or incomplete previews, non-BYOP mutation attempts, stale identity, indeterminate timeout state, malformed output, incomplete coverage, or unexplained drift.
6. Before apply or reset, summarize scope, evidence, rule, before/after proof, downstream effects, and lifecycle consequence, then require explicit approval in the current turn.
7. Verify the effective source and all approved prediction, target, and actual series before reporting success.

## Environment

The client requires:

```text
JALA_BYOP_API_BASE_URL=https://<host>/api
JALA_BYOP_ACCESS_TOKEN=<dedicated-user-access-token>
```

Require an absolute HTTP(S) base URL whose path ends in `/api`. Send the token only as an `Authorization: Bearer` header. Use the client's 30-second timeout. Keep credentials out of logs, diagnostics, handoff notes, and generated artifacts.

## Checks

- Target is authorized and unambiguous.
- The live contract and current effective source are recorded before the first candidate.
- One timezone-aware `as_of`, context sample, current source, candidate, approval, mutation, and verification remain bound to the same iteration.
- Farm mutations use confirmed real inheriting evidence cycles; non-BYOP cycles remain on their original path.
- JALA owns generated-row cleanup and regeneration.
- Every approved cycle and all three series have a concrete verification status before completion.

