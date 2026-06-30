# View and rerun a failed workflow

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh run list --repo owner/repo --status failure --limit 5
gh run rerun <run-id> --failed
```
