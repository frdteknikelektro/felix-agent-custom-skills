# API Access

**Read** (`github.read`):

```bash
gh api repos/[owner]/[repo]
gh api repos/[owner]/[repo]/issues --jq '.[].title'
gh api -H "Accept: application/vnd.github+json" /repos/[owner]/[repo]
```

**Write** (`github.write`):

```bash
gh api repos/[owner]/[repo]/git/refs -X POST -f ref="refs/heads/new-branch" -f sha="<commit-sha>"
```
