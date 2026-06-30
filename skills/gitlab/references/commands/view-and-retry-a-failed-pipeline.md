# View and retry a failed pipeline

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab ci list --repo my-group/my-project --status failed --per-page 5
glab ci retry <pipeline-id>
```
