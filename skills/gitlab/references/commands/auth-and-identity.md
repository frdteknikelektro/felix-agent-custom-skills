# Auth & Identity

Read-only (`gitlab.read`):

```bash
glab auth status
glab auth status --hostname <gitlab-host>
```

Returns authentication state. Use this to confirm the token works.

**Pull Current User** (`gitlab.read`):

```bash
glab api user
glab api user --jq '.username'
```
