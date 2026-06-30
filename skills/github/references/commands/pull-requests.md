# Pull Requests

**List pull requests** (`github.read`):

```bash
gh pr list
gh pr list --repo [owner/repo]
gh pr list --state open
gh pr list --state closed
gh pr list --state merged
gh pr list --base <branch>
gh pr list --label "<label>"
gh pr list --assignee <user>
gh pr list --author <user>
gh pr list --limit 50
gh pr list --search "<query>" --json number,title,state,author,createdAt
```

**View a pull request** (`github.read`):

```bash
gh pr view <number>
gh pr view <number> --repo [owner/repo]
gh pr view <number> --comments
gh pr view <number> --json number,title,body,state,reviews,commits,files
gh pr view <number> --web
```

**View PR diff** (`github.read`):

```bash
gh pr diff <number>
gh pr diff <number> --repo [owner/repo]
gh pr diff <number> --color never
```

**View PR review/comments** (`github.read`):

```bash
gh pr review <number> --json body,author,state,submittedAt
gh api repos/[owner]/[repo]/pulls/<number>/comments
```

**Create a pull request** (`github.write`):

```bash
gh pr create
gh pr create --title "<title>" --body "<body>"
gh pr create --title "<title>" --body "<body>" --base <branch> --head <branch>
gh pr create --title "<title>" --body "<body>" --draft
gh pr create --title "<title>" --body "<body>" --label "<label>"
gh pr create --title "<title>" --body "<body>" --assignee <user>
gh pr create --fill
```

**Merge a pull request** (`github.review`):

```bash
gh pr merge <number>
gh pr merge <number> --merge
gh pr merge <number> --squash
gh pr merge <number> --rebase
gh pr merge <number> --auto
gh pr merge <number> --delete-branch
```

Only merge when the user explicitly asks. If there are conflicts, warn and do not force-merge.

**Review a pull request** (`github.review`):

```bash
gh pr review <number> --approve
gh pr review <number> --comment --body "<feedback>"
gh pr review <number> --request-changes --body "<reason>"
```

**Close a pull request** (`github.write`):

```bash
gh pr close <number>
gh pr close <number> --comment "<reason>"
```

This is destructive. Only run when the user explicitly asks.

**Checkout a pull request** (`github.write`):

```bash
gh pr checkout <number>
gh pr checkout <number> --recurse-submodules
```
