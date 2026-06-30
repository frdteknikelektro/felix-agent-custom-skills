# Integrations

**List integrations** (`vercel.read`):

```bash
vercel integration ls $VERCEL_SCOPE
```

**Add an integration** (`vercel.write`):

```bash
vercel integration add <name> $VERCEL_SCOPE
```

**Remove an integration** (`vercel.write`):

```bash
vercel integration rm <name> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.

**List integration resources** (`vercel.read`):

```bash
vercel integration-resource ls $VERCEL_SCOPE
```

**Add integration resource** (`vercel.write`):

```bash
vercel integration-resource add <name> $VERCEL_SCOPE
```

**Remove integration resource** (`vercel.write`):

```bash
vercel integration-resource rm <name> $VERCEL_SCOPE --yes
```
