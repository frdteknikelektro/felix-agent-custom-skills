# List issues with labels

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh issue list --repo owner/repo --label bug --state open --limit 20
```
