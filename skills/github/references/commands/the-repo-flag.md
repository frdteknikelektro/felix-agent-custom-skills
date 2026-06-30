# The `--repo` Flag

Most `gh` commands auto-detect the repository from the git remote of the current working directory. For cross-repo operations or when not inside a git repo, explicitly pass `--repo owner/repo`:

```bash
gh issue list --repo octocat/hello-world
gh pr list --repo octocat/hello-world
gh secret set MY_SECRET --repo octocat/hello-world
```
