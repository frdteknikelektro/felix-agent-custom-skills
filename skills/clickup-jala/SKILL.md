---
id: clickup-jala
name: ClickUp Jala Management
description: "Manage Jala's ClickUp workspace — tasks, documents, team collaboration."
version: 1
enabled: true
kind: operational
permissions:
  - tasks.read
  - tasks.write
  - docs.read
  - docs.write
env:
  - key: CLICKUP_JALA_API_TOKEN
    description: ClickUp API token for Jala workspace (exported as CLICKUP_API_TOKEN)
    required: true
match:
  - clickup jala
  - jala task
---

# ClickUp Jala Management

## Purpose

Operate Jala's ClickUp workspace through the clickup skill. This skill extends the base `clickup` skill. All operations, command references, and behavior are identical — read [../clickup/SKILL.md](../clickup/SKILL.md) for the full reference. This skill only overrides the credential contract.

## Credential mapping

```bash
export CLICKUP_API_TOKEN="$CLICKUP_JALA_API_TOKEN"
```

Always export `CLICKUP_API_TOKEN` from `CLICKUP_JALA_API_TOKEN` before any ClickUp command.

## When to use

Activate when the user asks to interact with Jala's ClickUp workspace. Trigger words include "clickup jala", "jala task".

## Permissions

Same permission policy as the base `clickup` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `tasks.read` — inspect, list, view, search tasks and their fields.
- `tasks.write` — create, update, delete, comment on tasks, change status, set fields.
- `docs.read` — view, list, search documents and pages.
- `docs.write` — create, update, delete documents and pages.

If an operation is ambiguous, treat it as `tasks.write` or `docs.write` unless the user is only asking to inspect current state.

## Out of scope

- Non-Jala ClickUp workspaces — route to the base `clickup` skill

## Execution

1. Export `CLICKUP_API_TOKEN` from `CLICKUP_JALA_API_TOKEN`.
   Completion: `echo -n "$CLICKUP_API_TOKEN" | wc -c` returns a non-zero length.
2. Delegate to the base `clickup` skill for the actual operation.
   Completion: the base skill reports its result.

## Constraints

- All operations, command references, and behavior come from the base `clickup` skill — do not duplicate them here.
