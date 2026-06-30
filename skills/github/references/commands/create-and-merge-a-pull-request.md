# Create and merge a pull request

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh pr create --repo owner/repo --title "Add feature X" --body "Implements feature X" --base main --head feature-branch
gh pr merge <number> --squash --delete-branch
```
