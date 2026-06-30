# Trigger a pipeline

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab ci run --repo my-group/my-project --branch main --variables "DEPLOY=true"
```
