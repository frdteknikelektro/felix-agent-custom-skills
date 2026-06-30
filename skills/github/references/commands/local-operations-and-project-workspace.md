# Local Operations & Project Workspace

The designated workspace for cloned repositories is the `Project workspace` directory shown in the session contract (typically `/home/agent/workspace/projects`). When you need to clone and work on a repo locally, use this path:

```
workspace/projects/<owner>/<repo>/
```

**Clone a repository to the workspace** (`github.write`):

```bash
mkdir -p projects/<owner>
cd projects/<owner>
gh repo clone <owner/repo>
cd <repo>
```

**Pattern: clone, work, push**:

```bash
# 1. Clone into the project workspace
mkdir -p projects/<owner>
cd projects/<owner>
gh repo clone <owner/repo>
cd <repo>

# 2. Work: create branch, edit files, commit
git checkout -b feature/my-change
# edit files...
git add .
git commit -m "feat: description"

# 3. Push and create PR
git push -u origin feature/my-change
gh pr create --title "Title" --body "Description" --base main --head feature/my-change
```

**Checkout a PR for review**:

```bash
cd projects/<owner>/<repo>
gh pr checkout <number>
```

**Fork and clone**: Same as clone, substituting `gh repo fork --clone`:

```bash
gh repo fork <owner/repo> --clone
cd <repo>
```

Once inside a cloned repo, `gh` commands auto-detect the repository from the git remote. You do not need `--repo` in that case. Always `cd` into the project workspace directory before running git or repo-local gh commands.

Never clone into the thread session directory or a temporary directory. Always use `workspace/projects/<owner>/<repo>/`.
