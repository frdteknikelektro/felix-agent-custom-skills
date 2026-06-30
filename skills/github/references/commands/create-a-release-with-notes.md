# Create a release with notes

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
gh auth status
gh release create v1.0.0 --repo owner/repo --title "v1.0.0 Initial Release" --notes "First stable release" --generate-notes
```
