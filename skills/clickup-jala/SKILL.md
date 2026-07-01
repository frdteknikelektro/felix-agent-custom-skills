---
id: clickup-jala
name: ClickUp Jala Management
description: "Jala-specific ClickUp workspace management. Extends the base clickup skill — all operations are identical. The only difference is the credential: CLICKUP_JALA_API_TOKEN replaces CLICKUP_API_TOKEN."
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
  - jala clickup
  - jala task
  - jala clickup task
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

Activate when the user asks to interact with Jala's ClickUp workspace. Trigger words include "clickup jala", "jala clickup", "jala task".

## Out of scope

- Non-Jala ClickUp workspaces — route to the base `clickup` skill
