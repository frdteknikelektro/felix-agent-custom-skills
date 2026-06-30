# Create and merge a merge request

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab mr create --repo my-group/my-project --title "Add feature X" --description "Implements feature X" --target-branch main --source-branch feature-branch
glab mr merge <number> --squash --delete-source-branch
```
