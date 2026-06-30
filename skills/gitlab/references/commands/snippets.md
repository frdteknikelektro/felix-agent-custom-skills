# Snippets

**List snippets** (`gitlab.read`):

```bash
glab snippet list
glab snippet list --public
glab snippet list --private
glab snippet list --per-page 50
```

**View a snippet** (`gitlab.read`):

```bash
glab snippet view <snippet-id>
glab snippet view <snippet-id> --web
```

**Create a snippet** (`gitlab.write`):

```bash
glab snippet create
glab snippet create --title "<title>" --filename <file>
glab snippet create --title "<title>" --filename <file> --description "<desc>"
glab snippet create --title "<title>" --filename <file> --public
glab snippet create --title "<title>" --filename <file> --private
```

**Delete a snippet** (`gitlab.write`):

```bash
glab snippet delete <snippet-id>
```

This is destructive. Only run when the user explicitly asks.
