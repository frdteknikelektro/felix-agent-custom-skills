# Create an issue

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh issue create --repo owner/repo --title "Fix login bug" --body "Users cannot log in with SSO" --label bug
```
