# Search code across repositories

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh search code "TODO repo:owner/repo" --limit 20 --json path,repository
```
