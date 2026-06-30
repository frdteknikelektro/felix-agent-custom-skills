# Gists

**List gists** (`github.read`):

```bash
gh gist list
gh gist list --limit 50
gh gist list --public
gh gist list --secret
```

**View a gist** (`github.read`):

```bash
gh gist view <gist-id>
gh gist view <gist-id> --raw
gh gist view <gist-id> --files
gh gist view <gist-id> --web
```

**Create a gist** (`github.write`):

```bash
gh gist create <file>
gh gist create <file1> <file2> ...
gh gist create <file> --desc "<description>"
gh gist create <file> --public
gh gist create - <<< "$content"
```

**Edit a gist** (`github.write`):

```bash
gh gist edit <gist-id>
gh gist edit <gist-id> --desc "<new-description>"
gh gist edit <gist-id> --add <file>
```

**Delete a gist** (`github.write`):

```bash
gh gist delete <gist-id>
```

This is destructive. Only run when the user explicitly asks.
