---
name: jala-byop
description: >-
  Use for JALA Bring Your Own Prediction (BYOP) work: authoring, previewing,
  applying, resetting or verifying a farm- or cycle-scoped prediction, target or
  actual calculation, including FR fallback and future partial harvest. Always
  active on a turn whose event thread_key starts with api:jala-byop- (the BYOP
  widget). Runs with jali (production) or jali-staging (staging).
metadata:
  author: felix-agent
  kind: operational
  version: "2.0.0"
  match: jala byop, bring your own prediction, jala prediction, jala calculation, jala target, jala actual, jala feeding rate, jala mortality, jala FR, jala FR fallback, jala partial harvest, jala farm calculation, jala cycle calculation, byop widget, api:jala-byop-, byop-action, byop-panel, byop-prompts
---

# Jala BYOP (Bring Your Own Prediction)

## Purpose

Author, preview, apply, reset and verify JALA farm- or cycle-scoped BYOP calculations through JALA's stateless API, for the signed-in requester. JALA owns calculation, validation, persistence, generated-row cleanup and result rows; this skill owns the farmer interview, candidate loop, approval state and verification.

## When to use

Use on every turn whose event frontmatter has a `thread_key` starting with `api:jala-byop-` (for example `api:jala-byop-1312:session_…`). That is the BYOP widget's thread, including its hidden opening and authentication turns and any `<byop-action>` input. Also use when a farmer or JALA operator asks to change, preview, apply, reset or verify a prediction, target, actual, growth, feeding, mortality or FR calculation from any other thread.

## Out of scope

- Authentication, credential renewal and general JALA reads: `jali` owns them for production and `jali-staging` for staging.
- Local calculation engines, databases, PHP runtimes or direct result-row edits.
- Undocumented JALA endpoints or mutation paths, and non-JALA calculation systems.

## Use Cases

- Author or change a calculation in conversation: follow [the calculation workflow](references/calculation-workflow.md).
- Answer the BYOP widget: also follow [the widget protocol](references/widget-protocol.md) for panels, actions, readback proof and prompt choices.
- Reset or verify an existing calculation: the same workflow, from its baseline read.

## Permissions

This skill requires no permission grant and adds no authority. Every API call runs as the requester through the `jali` helper, so JALA's own user and farm authorization decides what is allowed. Apply and reset still require the requester's explicit approval in the current turn.

## Workflow

1. **Confirm thread access.** Run the helper `status` for the current event file through `jali`.
   Completion: the helper reports `authenticated` with the thread's `origin`; any other status follows the `jali` renewal case (or `jali-staging` for staging) before BYOP work starts.
2. **Read the workflow reference.** Read [the calculation workflow](references/calculation-workflow.md), and [the widget protocol](references/widget-protocol.md) for a widget turn.
   Completion: every rule section of the references that applies to this turn has been read.
3. **Run the authoring loop.** Use [the client](scripts/client.py) with `--event-file <current_event>` for target resolution, contract and context reads, previews, approval state, mutations and verification. JALA's API is the only source of calculated values.
   Completion: the baseline, each candidate preview and its warnings come from JALA responses bound to one freshness-gated iteration.
4. **Gate the write.** Before apply or reset, summarize scope, evidence, rule, before/after proof, downstream effects and lifecycle consequence, then wait for the requester's explicit approval in the current turn.
   Completion: an approval that names this unchanged proposal is on record, or no write happens.
5. **Verify and report.** Read back the effective source and all approved prediction, target and actual series, and report only observed results.
   Completion: every affected cycle and all three series carry a concrete verification status.

## Environment

This skill declares no environment variables and holds no credential. The thread's environment is the `origin` that `status` reports, and the helper uses it for every call:

- **BYOP widget threads:** the widget declares its JALA origin in `jali-auth.json`, so `jali` authenticates the thread on production or staging directly. Run `python3 scripts/client.py --event-file <current_event> ...` with no override.
- **Other threads without a declared origin:** `jali` authenticates on production; `jali-staging` authenticates on staging with its override, and the thread keeps that origin afterwards.

Report the environment from that `origin`, never from the conversation's wording.

## Checks

- The target is authorized for the requester and unambiguous.
- The live contract and current effective source are recorded before the first candidate.
- One timezone-aware `as_of`, context sample, current source, candidate, approval, mutation and verification stay bound to the same iteration.
- Farm mutations use confirmed real evidence cycles; cycle apply follows the lifecycle rules in the workflow.
- An uncertain mutation outcome is reconciled by readback before any retry.
- Every approved cycle and all three series have a concrete verification status before completion.
