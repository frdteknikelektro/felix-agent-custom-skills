# Output Formats & URL Patterns

## Task details

```
Task: Implement user authentication
Status: In Progress
Priority: High
Assignees: John Doe, Jane Smith
Due: 2024-01-15
Created: 2024-01-10
URL: https://app.clickup.com/t/86a1b2c3d

Description:
Add OAuth2 authentication with Google and GitHub providers...
```

## Task list

```
[to do] Fix login bug
  ID: 868h2cxat | Priority: high | Assignees: John Doe
  https://app.clickup.com/t/868h2cxat

[in progress] Update API docs
  ID: 868g7c75u | Priority: None | Assignees: Jane Smith
  https://app.clickup.com/t/868g7c75u

Total: 2 task(s)
```

## Comments

```
[2024-01-12 14:30] John Doe:
  Started working on this. Will push initial commit today.

[2024-01-12 16:45] Jane Smith:
  @John looks good! Let me know when ready for review.
```

## Doc details

```
Doc: API Documentation
ID: abc123def
Created: Jan 10, 2024, 09:30 AM
Updated: Jan 15, 2024, 02:45 PM
Creator: John Doe
Workspace: 12345678

Pages:
Introduction
  ID: page001

Getting Started
  ID: page002

API Reference
  ID: page003

Total: 3 page(s)
```

## Page content

```
Page: Getting Started
ID: page002
Created: Jan 10, 2024, 10:00 AM
Updated: Jan 14, 2024, 03:30 PM

Content:
---
# Getting Started

Welcome to the API documentation.

## Prerequisites
- Node.js 18+
- An API key
---
```

## URL patterns

The skill accepts both raw IDs and full ClickUp URLs.

**Tasks:**
- `https://app.clickup.com/t/{task_id}`
- `https://app.clickup.com/{team_id}/v/li/{list_id}?p={task_id}`
- Direct task ID: `86a1b2c3d`

**Lists:**
- `https://app.clickup.com/{team_id}/v/li/{list_id}`
- Direct list ID: `901111220963`

**Docs:**
- `https://app.clickup.com/{team_id}/v/dc/{doc_id}`
- `https://app.clickup.com/{team_id}/docs/{doc_id}`
- Direct doc ID: `abc123def`

## Tips

- Team ID, User ID, and default list ID are auto-cached in `.env`
- Use natural language dates: "tomorrow", "next friday", "+3d"
- Use `--json` for scripting or piping to other tools
- Doc content uses markdown format for both input and output
- The Docs API uses v3 endpoints (workspace-based instead of team-based)

## Markdown handling

ClickUp uses different content formats for different features:

| Feature | API Version | Content Format |
|---------|-------------|----------------|
| Comments | v2 | Proprietary JSON array (converted via `markdownToClickUp()`) |
| Task descriptions | v2 | Native markdown via `markdown_description` field |
| Docs/Pages | v3 | Native markdown (no conversion needed) |
