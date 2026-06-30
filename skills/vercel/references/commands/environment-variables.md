# Environment Variables

**List env vars** (`vercel.read`):

```bash
vercel env ls $VERCEL_SCOPE
vercel env ls <environment> $VERCEL_SCOPE  # production, preview, development
```

**Pull env vars** (`vercel.read`):

```bash
vercel env pull [file] $VERCEL_SCOPE
vercel env pull [file] --environment=<production|preview|development> $VERCEL_SCOPE
```

**Add an env var** (`vercel.write`):

```bash
vercel env add <key> <environment> $VERCEL_SCOPE
# Prompts for value. For non-interactive, use:
echo "<value>" | vercel env add <key> <environment> $VERCEL_SCOPE
```

Or use the `--yes` flag with stdin:

```bash
vercel env add <key> --environment=<production|preview|development> --yes $VERCEL_SCOPE <<< "<value>"
```

Never print env var values in replies. Refer to them by key name only.

**Remove an env var** (`vercel.write`):

```bash
vercel env rm <key> <environment> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.
