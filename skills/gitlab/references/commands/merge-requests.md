# Merge Requests

**List merge requests** (`gitlab.read`):

```bash
glab mr list
glab mr list --repo <namespace/project>
glab mr list --assignee @me
glab mr list --reviewer @me
glab mr list --author @me
glab mr list --label "<label>"
glab mr list --state opened
glab mr list --state closed
glab mr list --state merged
glab mr list --target-branch <branch>
glab mr list --source-branch <branch>
glab mr list --search "<keyword>"
glab mr list --per-page 50
glab mr list --output json
```

**View a merge request** (`gitlab.read`):

```bash
glab mr view <number>
glab mr view <number> --repo <namespace/project>
glab mr view <number> --comments
glab mr view <number> --web
glab mr view <number> --output json
```

**View MR diff** (`gitlab.read`):

```bash
glab mr diff <number>
glab mr diff <number> --repo <namespace/project>
glab mr diff <number> --color never
```

**View MR approvers** (`gitlab.read`):

```bash
glab mr approvers <number>
```

**Create a merge request** (`gitlab.write`):

```bash
glab mr create
glab mr create --title "<title>" --description "<body>"
glab mr create --title "<title>" --description "<body>" --target-branch <branch> --source-branch <branch>
glab mr create --title "<title>" --description "<body>" --draft
glab mr create --title "<title>" --description "<body>" --assignee <user>
glab mr create --title "<title>" --description "<body>" --reviewer <user>
glab mr create --title "<title>" --description "<body>" --label "<label>"
glab mr create --title "<title>" --description "<body>" --milestone "<milestone>"
glab mr create --fill
glab mr create --remove-source-branch
glab mr create --squash-before-merge
```

**Merge a merge request** (`gitlab.review`):

```bash
glab mr merge <number>
glab mr merge <number> --squash
glab mr merge <number> --delete-source-branch
glab mr merge <number> --auto
```

Only merge when the user explicitly asks. If there are conflicts, warn and do not force-merge.

**Approve a merge request** (`gitlab.review`):

```bash
glab mr approve <number>
glab mr approve <number> --sha <commit-sha>
```

**Comment on a merge request** (`gitlab.review`):

```bash
glab mr note <number> --message "<comment>"
```

**Close a merge request** (`gitlab.write`):

```bash
glab mr close <number>
```

This is destructive. Only run when the user explicitly asks.

**Checkout a merge request** (`gitlab.write`):

```bash
glab mr checkout <number>
glab mr checkout <number> --branch <local-branch>
```
