# Issues

**List issues** (`github.read`):

```bash
gh issue list
gh issue list --repo [owner/repo]
gh issue list --label "<label>"
gh issue list --assignee <user>
gh issue list --state open
gh issue list --state closed
gh issue list --limit 50
gh issue list --search "<query>" --json number,title,state,labels
gh issue list --json number,title,state,assignees,labels,createdAt,updatedAt
```

**View an issue** (`github.read`):

```bash
gh issue view <number>
gh issue view <number> --repo [owner/repo]
gh issue view <number> --comments
gh issue view <number> --json number,title,body,state,labels,assignees,comments
gh issue view <number> --web
```

**Search issues** (`github.read`):

```bash
gh search issues <query>
gh search issues <query> --limit 50
gh search issues <query> --repo [owner/repo]
gh search issues <query> --json number,title,state,repository
```

**Create an issue** (`github.write`):

```bash
gh issue create
gh issue create --title "<title>" --body "<body>"
gh issue create --title "<title>" --body "<body>" --repo [owner/repo]
gh issue create --title "<title>" --body "<body>" --assignee <user>
gh issue create --title "<title>" --body "<body>" --label "<label>"
gh issue create --title "<title>" --body-file <file-path>
```

**Close/Reopen an issue** (`github.write`):

```bash
gh issue close <number>
gh issue close <number> --comment "<reason>"
gh issue reopen <number>
gh issue reopen <number> --comment "<reason>"
```

**Edit an issue** (`github.write`):

```bash
gh issue edit <number>
gh issue edit <number> --title "<new-title>"
gh issue edit <number> --body "<new-body>"
gh issue edit <number> --add-label "<label>"
gh issue edit <number> --remove-label "<label>"
```
