# View a specific repository

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh repo view owner/repo --json name,description,url,stargazerCount,defaultBranchRef
```
