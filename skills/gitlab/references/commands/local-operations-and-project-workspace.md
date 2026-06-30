# Local Operations & Project Workspace

The designated workspace for cloned repositories is the `Project workspace` directory shown in the session contract (typically `/home/agent/workspace/projects`). When you need to clone and work on a repo locally, use this path:

```
workspace/projects/<namespace>/<project>/
```

**Clone a repository to the workspace** (`gitlab.write`):

```bash
mkdir -p projects/<namespace>
cd projects/<namespace>
glab repo clone <namespace/project>
cd <project>
```

**Pattern: clone, work, push**:

```bash
# 1. Clone into the project workspace
mkdir -p projects/<namespace>
cd projects/<namespace>
glab repo clone <namespace/project>
cd <project>

# 2. Work: create branch, edit files, commit
git checkout -b feature/my-change
# edit files...
git add .
git commit -m "feat: description"

# 3. Push and create MR
git push -u origin feature/my-change
glab mr create --title "Title" --description "Description" --target-branch main --source-branch feature/my-change
```

**Checkout an MR for review**:

```bash
cd projects/<namespace>/<project>
glab mr checkout <number>
```

Never clone into the thread session directory or a temporary directory. Always use `workspace/projects/<namespace>/<project>/`.
