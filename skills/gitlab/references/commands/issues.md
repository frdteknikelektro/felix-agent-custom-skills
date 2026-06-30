# Issues

**List issues** (`gitlab.read`):

```bash
glab issue list
glab issue list --repo <namespace/project>
glab issue list --assignee @me
glab issue list --label "<label>"
glab issue list --state opened
glab issue list --state closed
glab issue list --iteration current
glab issue list --per-page 50
glab issue list --search "<query>"
glab issue list --output json
```

**View an issue** (`gitlab.read`):

```bash
glab issue view <number>
glab issue view <number> --repo <namespace/project>
glab issue view <number> --comments
glab issue view <number> --web
glab issue view <number> --output json
```

**Search issues** (`gitlab.read`):

```bash
glab issue list --search "<keyword>"
glab api search --field scope=issues --field search="<query>"
```

**Create an issue** (`gitlab.write`):

```bash
glab issue create
glab issue create --title "<title>" --description "<body>"
glab issue create --title "<title>" --description "<body>" --repo <namespace/project>
glab issue create --title "<title>" --description "<body>" --assignee <user>
glab issue create --title "<title>" --description "<body>" --label "<label>"
glab issue create --title "<title>" --description "<body>" --milestone "<milestone>"
glab issue create --title "<title>" --description "<body>" --weight 3
```

Use GitLab Flavored Markdown in descriptions: task lists (`- [ ]`), tables, code blocks, etc.

**Close/Reopen an issue** (`gitlab.write`):

```bash
glab issue close <number>
glab issue close <number> --repo <namespace/project>
glab issue reopen <number>
```

**Add a comment to an issue** (`gitlab.review`):

```bash
glab issue note <number> --message "<comment>"
```
