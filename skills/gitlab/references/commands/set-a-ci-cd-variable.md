# Set a CI/CD variable

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab variable set DEPLOY_KEY --repo my-group/my-project --value "<secret-value>" --masked
```
