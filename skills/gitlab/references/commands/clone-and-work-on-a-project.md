# Clone and work on a project

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
mkdir -p projects/my-group
cd projects/my-group
glab repo clone my-group/my-project
cd my-project
git checkout -b fix-typo
```
