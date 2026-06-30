# Trigger a workflow dispatch

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh workflow list --repo owner/repo
gh workflow run deploy.yml --repo owner/repo --ref main -f environment=production
```
