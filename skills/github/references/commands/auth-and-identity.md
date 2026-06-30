# Auth & Identity

Read-only (`github.read`):

```bash
gh auth status
gh auth status --hostname <github-enterprise-host>
```

Returns authentication state. Use this to confirm the token works.

**Pull Current User** (`github.read`):

```bash
gh api user
gh api user --jq '.login'
```
