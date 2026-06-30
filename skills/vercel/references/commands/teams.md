# Teams

**List teams** (`vercel.read`):

```bash
vercel teams ls
```

**Add a team** (`vercel.write`):

```bash
vercel teams add
```

**Remove a team** (destructive, `vercel.write`):

Only through the Vercel dashboard. The CLI does not support `teams rm`.

**Switch team scope** (`vercel.write`):

```bash
vercel switch <team-slug>
```

This changes the active scope for subsequent commands. Use `VERCEL_SCOPE` to scope individual commands instead.
