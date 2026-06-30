# List issues with labels

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab issue list --repo my-group/my-project --label bug --state opened --per-page 20
```
