# Repositories

**List repositories** (`github.read`):

```bash
gh repo list [owner]
gh repo list [owner] --limit 100
gh repo list [owner] --language <lang>
gh repo list [owner] --source
gh repo list [owner] --fork
gh repo list [owner] --archived
gh repo list [owner] --no-archived
```

**View a repository** (`github.read`):

```bash
gh repo view [owner/repo]
gh repo view [owner/repo] --json name,description,url,stargazerCount,forkCount,defaultBranchRef
gh repo view [owner/repo] --web
```

**Create a repository** (`github.write`):

```bash
gh repo create <name>
gh repo create <name> --description "<desc>"
gh repo create <name> --public
gh repo create <name> --private
gh repo create <name> --clone
gh repo create <name> --template <template-repo>
```

**Edit a repository** (`github.write`):

```bash
gh repo edit [owner/repo]
gh repo edit [owner/repo] --description "<desc>"
gh repo edit [owner/repo] --add-topic <topic>
gh repo edit [owner/repo] --remove-topic <topic>
gh repo edit [owner/repo] --enable-wiki=false
gh repo edit [owner/repo] --default-branch <branch>
```

**Fork a repository** (`github.write`):

```bash
gh repo fork [owner/repo]
gh repo fork [owner/repo] --clone
gh repo fork [owner/repo] --remote
```

**Archive a repository** (`github.write`):

```bash
gh repo archive [owner/repo] --yes
```

**Rename a repository** (`github.write`):

```bash
gh repo rename <new-name>
gh repo rename <new-name> --repo [owner/repo] --yes
```

**Delete a repository** (`github.write`):

```bash
gh repo delete [owner/repo] --yes
```

This is destructive. Only run when the user explicitly asks.
