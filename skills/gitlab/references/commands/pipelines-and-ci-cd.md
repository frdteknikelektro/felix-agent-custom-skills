# Pipelines & CI/CD

**List pipelines** (`gitlab.read`):

```bash
glab ci list
glab ci list --repo <namespace/project>
glab ci list --status running
glab ci list --status success
glab ci list --status failed
glab ci list --branch <branch>
glab ci list --per-page 20
glab ci list --output json
```

**View a pipeline** (`gitlab.read`):

```bash
glab ci view <pipeline-id>
glab ci view <pipeline-id> --repo <namespace/project>
glab ci view <pipeline-id> --web
```

**View pipeline status** (`gitlab.read`):

```bash
glab ci status
glab ci status --branch <branch>
glab ci status --repo <namespace/project>
```

**View pipeline trace/jobs** (`gitlab.read`):

```bash
glab ci trace <job-id>
glab ci trace <job-id> --repo <namespace/project>
```

**List CI jobs** (`gitlab.read`):

```bash
glab job list
glab job list --repo <namespace/project>
glab job list --pipeline <pipeline-id>
```

**Run a pipeline** (`gitlab.write`):

```bash
glab ci run
glab ci run --branch <branch>
glab ci run --repo <namespace/project>
glab ci run --variables "KEY=VALUE"
```

**Retry a pipeline or job** (`gitlab.write`):

```bash
glab ci retry <pipeline-id>
glab ci retry <job-id>
```

**Cancel a pipeline** (`gitlab.write`):

```bash
glab ci cancel <pipeline-id>
```
