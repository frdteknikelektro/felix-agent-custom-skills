# Projects

**List projects** (`vercel.read`):

```bash
vercel projects ls $VERCEL_SCOPE
```

**Add a project** (`vercel.write`):

```bash
vercel projects add <project-name> $VERCEL_SCOPE
```

**Remove a project** (`vercel.write`):

```bash
vercel projects rm <project-name> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.
