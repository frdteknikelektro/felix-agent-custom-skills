# Set a repository secret

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh secret set DEPLOY_KEY --repo owner/repo --body "<secret-value>"
```
