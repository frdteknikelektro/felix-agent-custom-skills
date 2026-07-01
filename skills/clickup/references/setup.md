# Setup

## Authentication

1. Generate a Personal API Token (starts with `pk_`) at: ClickUp Settings > Apps > API Token
2. Export the token before using the skill:

```bash
export CLICKUP_API_TOKEN="pk_your_token_here"
```

Add to your shell profile (`~/.zshrc`, `~/.bashrc`) for persistence.

## Optional env vars

Team ID and User ID are auto-detected on first run. To skip detection:

```bash
export CLICKUP_TEAM_ID="your_team_id"
export CLICKUP_USER_ID="your_user_id"
```

Use `node skills/clickup/query.mjs me` to see your user info.

## Default list (optional)

Set `CLICKUP_DEFAULT_LIST_ID` to skip `list_id` when creating tasks:

```bash
export CLICKUP_DEFAULT_LIST_ID="901111220963"
```

## Markdown support (optional)

Comment posting works out of the box (plain text). For rich markdown formatting in comments, install optional dependencies globally:

```bash
npm install -g unified remark-parse
```

Without these deps, comments are sent as plain text. With them, comments support bold, italic, code blocks, lists, and links.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid or missing token | Check `CLICKUP_API_TOKEN` is exported |
| 404 Not Found | Task/list/doc doesn't exist or no access | Verify ID and workspace access |
| Rate limited | Too many requests | Wait and retry; limits vary by plan |
