# Task Commands

```bash
node skills/clickup/query.mjs <command> [options]
```

## Read operations

| Command | Description |
|---------|-------------|
| `get <url\|id>` | Get task details (name, description, status, assignees, etc.) |
| `my-tasks` | List all tasks assigned to you across workspace |
| `search "query"` | Search tasks by name or description |
| `tasks <list_id>` | List tasks in a list |
| `comments <url\|id>` | List comments on a task |

## Write operations

| Command | Description |
|---------|-------------|
| `create [list_id] "title"` | Create a new task (list_id optional if default set) |
| `status <url\|id> [status]` | Update task status (or list available statuses) |
| `assign <task> <user>` | Assign task to a user (by name, email, or ID) |
| `due <task> "date"` | Set due date (e.g., "tomorrow", "friday", "+3d") |
| `priority <task> <level>` | Set priority (urgent, high, normal, low, none) |
| `subtask <task> "title"` | Create a subtask |
| `move <task> <list_id>` | Move task to a different list |
| `tag <task> "tag_name"` | Add a tag to task |
| `description <task> "text"` | Update task description (markdown supported) |
| `checklist <task> "item"` | Add checklist item to task |
| `link <task> <url> ["desc"]` | Add external link reference (as comment) |
| `comment <url\|id> "message"` | Post a comment to a task (supports markdown) |
| `delete-comment <comment_id>` | Delete a comment |
| `watch <task> <user>` | Notify user via @mention comment |

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON response |
| `--subtasks` | Include subtasks when getting task details |
| `--me` | Filter to tasks assigned to me (for tasks command) |

## Examples

### Get task details

```bash
# Using full URL
node skills/clickup/query.mjs get "https://app.clickup.com/t/86a1b2c3d"

# Using task ID directly
node skills/clickup/query.mjs get 86a1b2c3d

# Include subtasks
node skills/clickup/query.mjs get 86a1b2c3d --subtasks
```

### Create a task

```bash
# With explicit list ID
node skills/clickup/query.mjs create 901111220963 "New feature: dark mode"

# Using default list (if CLICKUP_DEFAULT_LIST_ID is set)
node skills/clickup/query.mjs create "Quick task"
```

### List my tasks

```bash
node skills/clickup/query.mjs my-tasks
```

### Search tasks

```bash
node skills/clickup/query.mjs search "authentication"
```

### Update task status

```bash
# List available statuses for a task
node skills/clickup/query.mjs status 86a1b2c3d

# Update status (case-insensitive, partial match)
node skills/clickup/query.mjs status 86a1b2c3d "in progress"
node skills/clickup/query.mjs status 86a1b2c3d "complete"
```

### Assign tasks

```bash
# Assign by username
node skills/clickup/query.mjs assign 86a1b2c3d justin

# Assign by email
node skills/clickup/query.mjs assign 86a1b2c3d jane@example.com
```

### Set due dates

```bash
node skills/clickup/query.mjs due 86a1b2c3d "tomorrow"
node skills/clickup/query.mjs due 86a1b2c3d "next friday"
node skills/clickup/query.mjs due 86a1b2c3d "+3d"
node skills/clickup/query.mjs due 86a1b2c3d "2024-01-15"
```

### Set priority

```bash
node skills/clickup/query.mjs priority 86a1b2c3d urgent
node skills/clickup/query.mjs priority 86a1b2c3d high
node skills/clickup/query.mjs priority 86a1b2c3d none  # Clear priority
```

### Create subtasks

```bash
node skills/clickup/query.mjs subtask 86a1b2c3d "Write unit tests"
node skills/clickup/query.mjs subtask 86a1b2c3d "Update documentation"
```

### Move tasks

```bash
node skills/clickup/query.mjs move 86a1b2c3d 901111220964
```

### Add links

```bash
# Add link with description
node skills/clickup/query.mjs link 86a1b2c3d "https://github.com/..." "PR #123"

# Add link without description
node skills/clickup/query.mjs link 86a1b2c3d "https://docs.example.com/guide"
```

### Add checklist items

```bash
node skills/clickup/query.mjs checklist 86a1b2c3d "Review code"
node skills/clickup/query.mjs checklist 86a1b2c3d "Run tests"
node skills/clickup/query.mjs checklist 86a1b2c3d "Deploy to staging"
```

### List tasks in a list

```bash
# All tasks in a list
node skills/clickup/query.mjs tasks 901111220963

# Only tasks assigned to me
node skills/clickup/query.mjs tasks 901111220963 --me
```

### View comments

```bash
node skills/clickup/query.mjs comments "https://app.clickup.com/t/86a1b2c3d"
```

### Post a comment

```bash
node skills/clickup/query.mjs comment 86a1b2c3d "Starting work on this task"

# Multi-line comment
node skills/clickup/query.mjs comment 86a1b2c3d "Status update:
- Completed initial review
- Found 3 issues to address
- Will submit PR by EOD"
```

### Show current user

```bash
node skills/clickup/query.mjs me
```

### Delete a comment

```bash
# Get comment IDs from the comments command (shown in --json output)
node skills/clickup/query.mjs delete-comment 90110200841741
```

### Notify users (watch)

```bash
# Notify user via @mention comment (ClickUp API doesn't support adding watchers directly)
node skills/clickup/query.mjs watch 86a1b2c3d koen

# Notify by email
node skills/clickup/query.mjs watch 86a1b2c3d jane@example.com
```

### Add tags

```bash
node skills/clickup/query.mjs tag 86a1b2c3d "DevOps"
node skills/clickup/query.mjs tag 86a1b2c3d "bug"
```

### Update description

```bash
node skills/clickup/query.mjs description 86a1b2c3d "## Summary
This is a **bold** statement.

- Item 1
- Item 2

See [documentation](https://example.com) for more info."
```
