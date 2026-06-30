# Aliases

**List aliases** (`vercel.read`):

```bash
vercel alias ls $VERCEL_SCOPE
```

**Set an alias** (`vercel.write`):

```bash
vercel alias set <deployment-url> <alias> $VERCEL_SCOPE
```

**Remove an alias** (`vercel.write`):

```bash
vercel alias rm <alias> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.
