# Create a release

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
glab auth status
glab release create v1.0.0 --repo my-group/my-project --name "v1.0.0 Initial Release" --notes "First stable release"
```
