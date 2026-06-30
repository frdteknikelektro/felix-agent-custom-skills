# Actions & Workflows

**List workflow runs** (`github.read`):

```bash
gh run list
gh run list --repo [owner/repo]
gh run list --workflow <workflow-name>
gh run list --branch <branch>
gh run list --limit 20
gh run list --status success
gh run list --status failure
gh run list --json name,status,conclusion,headBranch,createdAt,workflowDatabaseId
```

**View a run** (`github.read`):

```bash
gh run view <run-id>
gh run view <run-id> --repo [owner/repo]
gh run view <run-id> --log
gh run view <run-id> --job <job-id>
gh run view <run-id> --web
```

**Watch a run** (`github.read`):

```bash
gh run watch <run-id>
gh run watch <run-id> --exit-status
gh run watch <run-id> --interval 10
```

**List workflows** (`github.read`):

```bash
gh workflow list
gh workflow list --repo [owner/repo]
gh workflow list --limit 20
```

**Rerun a workflow** (`github.write`):

```bash
gh run rerun <run-id>
gh run rerun <run-id> --failed
```

**Cancel a workflow run** (`github.write`):

```bash
gh run cancel <run-id>
```

**Trigger a workflow** (`github.write`):

```bash
gh workflow run <workflow-name>
gh workflow run <workflow-name> --repo [owner/repo]
gh workflow run <workflow-name> --ref <branch>
gh workflow run <workflow-name> -f key=value
```
