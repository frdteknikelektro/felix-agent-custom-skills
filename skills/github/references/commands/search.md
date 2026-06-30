# Search

**Search repositories** (`github.read`):

```bash
gh search repos <query>
gh search repos <query> --limit 50
gh search repos "language:typescript stars:>100"
gh search repos <query> --json name,url,stargazersCount
```

**Search issues** (`github.read`):

```bash
gh search issues <query>
gh search issues <query> --limit 50
gh search issues "label:bug state:open"
gh search issues <query> --json number,title,state,repository
```

**Search pull requests** (`github.read`):

```bash
gh search prs <query>
gh search prs <query> --limit 50
gh search prs "is:open draft:true"
gh search prs <query> --json number,title,state,author
```

**Search commits** (`github.read`):

```bash
gh search commits <query>
gh search commits <query> --limit 50
gh search commits "fix: repo:<owner/repo>"
```

**Search code** (`github.read`):

```bash
gh search code <query>
gh search code <query> --limit 100
gh search code "class User repo:<owner/repo>"
gh search code <query> --language <lang>
gh search code <query> --extension <ext>
gh search code <query> --json path,repository
```
