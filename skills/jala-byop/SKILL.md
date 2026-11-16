---
name: jala-byop
description: >-
  Explain JALA prediction methods, switch a cycle method, or author, preview,
  apply, reset and verify BYOP calculations. Always active on a turn whose event
  thread_key starts with api:jala-byop- (the BYOP widget). Runs with jali (production)
  or jali-staging (staging).
metadata:
  author: felix-agent
  kind: operational
  version: "2.1.2"
  match: jala byop, bring your own prediction, jala prediction, jala calculation, jala target, jala actual, jala feeding rate, jala mortality, jala FR, jala FR fallback, jala partial harvest, jala farm calculation, jala cycle calculation, prediction method, metode prediksi, fixed, fcr, stp_fr, ai_cultivation, byop widget, api:jala-byop-, byop-action, byop-panel, byop-prompts
---

# Jala BYOP (Bring Your Own Prediction)

## Purpose

Author, preview, apply, reset and verify JALA farm- or cycle-scoped BYOP calculations, and switch an existing cycle's prediction method, through JALA's API for the signed-in requester. JALA owns calculation, validation, persistence, generated-row cleanup and result rows; this skill owns the farmer interview, candidate loop, approval state and verification.

## Prediction conversation

Follow `jali`'s conversation style for every customer-facing reply. Explain methods using their friendly names in **bold**, with normal prose for formulas and their practical effect. For example: "**Tabel FR STP** memakai tabel acuan FR dan bobot STP. Hasil estimasi bobot dan pakan bisa berbeda dari **Feed Ratio standar**."

Keep method identifiers such as `stp_fr`, calculation expressions, AST/JSON and code fences in internal work and machine-readable protocol blocks. Show code only when the requester explicitly asks for it. In ordinary replies, describe a formula in words, such as "Tambahkan pertumbuhan 0,2 gram per hari", and distinguish a proposal, a preview and an applied result. Panel titles, descriptions, warnings and prompt labels use the same friendly vocabulary in plain text; the widget supplies their typography, so keep Markdown markers out of those fields. Preserve protocol keys, method values, expressions, hashes and verification evidence exactly.

## When to use

Use on every turn whose event frontmatter has a `thread_key` starting with `api:jala-byop-` (for example `api:jala-byop-1312:session_…`). That is the BYOP widget's thread, including its hidden opening and authentication turns and any `<byop-action>` input. Also use outside the widget for prediction-method explanations or changes and custom prediction, target, actual, growth, feeding or mortality calculations.

## Out of scope

- Authentication, credential renewal and general JALA reads: `jali` owns them for production and `jali-staging` for staging.
- Local calculation engines, databases, PHP runtimes or direct result-row edits.
- Undocumented JALA endpoints or mutation paths, and non-JALA calculation systems.

## Use Cases

- List and explain all eight JALA prediction methods, or switch a cycle method to `fr`, `stp_fr`, `fixed`, `fcr` or `ai_cultivation`: follow [cycle prediction methods](references/cycle-prediction-methods.md). A method switch updates the cycle setting, independently of custom formula authoring.
- Author or change a calculation in conversation: follow [the calculation workflow](references/calculation-workflow.md).
- Answer the BYOP widget: also follow [the widget protocol](references/widget-protocol.md) for panels, actions, readback proof and prompt choices.
- Reset or verify an existing calculation: the same workflow, from its baseline read.

## Permissions

This skill requires no permission grant and adds no authority. Every API call runs as the requester through the `jali` helper, so JALA's own user and farm authorization decides what is allowed. Method changes, apply and reset still require the requester's explicit approval in the current turn.

## Workflow

1. **Route the request.** Distinguish a method explanation, a cycle-method switch, custom calculation authoring, and widget control messages. Resolve ambiguity with one concise question. For widget init/auth control messages, follow `jali`'s control-message workflow before substantive BYOP work.
   Completion: one operation is selected, or the required clarification/control reply is returned.
2. **Establish access when needed.** General method explanations use the reference without JALA authentication. Before reading or changing requester data, run the `jali` helper `status` with the current event file; use the exact `origin` it reports and follow its authentication/renewal workflow if needed.
   Completion: the answer needs no requester data, or access is authenticated for this thread, or the dependent operation stops with its next step explained.
3. **Follow the selected case.** Use [cycle prediction methods](references/cycle-prediction-methods.md) for explanations and method switches; use [the calculation workflow](references/calculation-workflow.md) and [the client](scripts/client.py) with `--event-file <current_event>` for custom formula work. For widget replies, also read [the widget protocol](references/widget-protocol.md).
   Completion: the selected case's read/preview requirements are satisfied, or its concrete blocker is identified.
4. **Gate the write.** Follow the selected case's proposal and current-turn approval rules. If approval already covers the unchanged proposal, continue; otherwise obtain it before mutation. Reconcile an uncertain outcome by readback before considering another attempt.
   Completion: each approved write has an observed or explicitly uncertain outcome; informational and unapproved requests make no write.
5. **Verify and report.** Meet the selected case's completion criteria and use the applicable widget reply format. Separate saved method, generated results, and verified custom calculation claims.
   Completion: the reply states only observed results and identifies any pending/failed verification.

## Environment

This skill declares no environment variables and holds no credential. The thread's environment is the `origin` that `status` reports, and the helper uses it for every call:

- **BYOP widget threads:** the widget declares its JALA origin in `jali-auth.json`, so `jali` authenticates the thread on production or staging directly. Use the selected case's helper/client command with `--event-file <current_event>` and no origin override.
- **Other threads without a declared origin:** `jali` authenticates on production; `jali-staging` authenticates on staging with its override, and the thread keeps that origin afterwards.

Report the environment from that `origin`, never from the conversation's wording.

## Checks

- The target is authorized for the requester and unambiguous.
- Method changes follow the cycle-method reference, with exact method readback and separate result-generation status.
- For custom formulas, the live contract and current effective source are recorded before the first candidate.
- For custom formulas, one timezone-aware `as_of`, context sample, current source, candidate, approval, mutation and verification stay bound to the same iteration.
- Farm mutations use confirmed real evidence cycles; cycle apply follows the lifecycle rules in the workflow.
- An uncertain mutation outcome is reconciled by readback before any retry.
- For calculation changes, every approved cycle and all three series have a concrete verification status before completion.
