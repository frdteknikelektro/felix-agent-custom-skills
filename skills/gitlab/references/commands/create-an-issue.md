# Create an issue

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab issue create --repo my-group/my-project --title "Fix login bug" --description "Users cannot log in with SSO" --label bug
```
