---
name: clickup
description: ClickUp workspace and task management. Use when the user mentions ClickUp tasks, URLs, IDs, or wants to create/update/query ClickUp items.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: tasks.read, tasks.write, docs.read, docs.write
  match: clickup, click up, my tasks, create task, task status, clickup task
env:
  - key: CLICKUP_API_TOKEN
    description: Personal API token (pk_...) from ClickUp Settings > Apps
    required: true
---

# ClickUp

Manage ClickUp workspace: tasks, documents, and team collaboration.

**Workspace hierarchy:** Workspace → Space → Folder → List → Task → Subtask

## Permissions

- `tasks.read` — inspect, list, view, search tasks and their fields.
- `tasks.write` — create, update, delete, comment on tasks, change status, set fields.
- `docs.read` — view, list, search documents and pages.
- `docs.write` — create, update, delete documents and pages.

If an operation is ambiguous, treat it as `tasks.write` or `docs.write` unless the user is only asking to inspect current state.

## Branches

- **Task operations:** Read [task reference](references/tasks.md) for task commands, examples, and options
- **Document operations:** Read [docs reference](references/docs.md) for doc commands and page management
- **Setup/troubleshooting:** Read [setup](references/setup.md) for auth, env config, and error fixes
- **Output formats:** Read [formats](references/formats.md) for output patterns, URL formats, and tips

## Quick reference

```bash
# Set token (required before first use)
export CLICKUP_API_TOKEN="pk_your_token_here"

# Most common commands
node skills/clickup/query.mjs me                          # Current user info
node skills/clickup/query.mjs my-tasks                    # My assigned tasks
node skills/clickup/query.mjs get <task_id>               # Task details
node skills/clickup/query.mjs create "Title"               # Create task (needs default list)
node skills/clickup/query.mjs status <task_id> "done"      # Update status
node skills/clickup/query.mjs comment <task_id> "Update"   # Post comment
```

## Execution

1. Identify the branch (task, doc, setup, or formats).
   Completion: correct branch file loaded.
2. Follow the branch instructions.
   Completion: command executed successfully with output shown.
3. Report the result.
   Completion: user sees the output or confirmation.

## Constraints

- Always use `query.mjs` as the CLI entry point.
- Pass URLs or IDs directly; the skill extracts IDs automatically.
- Never hardcode API tokens in commands.
- Use `--json` flag for machine-readable output.
- Doc content uses markdown format for both input and output.
