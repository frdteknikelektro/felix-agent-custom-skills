# Deployments

**List deployments** (`vercel.read`):

```bash
vercel ls [project-name] $VERCEL_SCOPE
vercel list [project-name] $VERCEL_SCOPE --prod
```

**Inspect a deployment** (`vercel.read`):

```bash
vercel inspect <deployment-url-or-id> $VERCEL_SCOPE
```

**Deploy** (`vercel.write`):

```bash
vercel $VERCEL_SCOPE
vercel deploy $VERCEL_SCOPE
vercel deploy --prod $VERCEL_SCOPE
vercel deploy --prebuilt $VERCEL_SCOPE
vercel deploy --archive=tgz $VERCEL_SCOPE
```

Options:
- `--prod` — promote immediately to production
- `--prebuilt` — skip build step, use prebuilt output
- `--archive=tgz` — deploy from a pre-packaged archive
- `--env KEY=value` — set env variable for this deployment only

**Rollback** (`vercel.write`):

```bash
vercel rollback [deployment-url-or-id] $VERCEL_SCOPE
vercel rollback --prod $VERCEL_SCOPE  # rollback production to previous
```

This is destructive. Only run when the user explicitly asks for a rollback. Confirm the target deployment before proceeding.

**Promote a deployment** (`vercel.write`):

```bash
vercel promote <deployment-url-or-id> $VERCEL_SCOPE
```

**View logs** (`vercel.read`):

```bash
vercel logs <deployment-url-or-id> $VERCEL_SCOPE
vercel logs <deployment-url-or-id> --follow $VERCEL_SCOPE
vercel logs <deployment-url-or-id> --since 1h $VERCEL_SCOPE
vercel logs <deployment-url-or-id> --until 2024-01-01T00:00:00Z $VERCEL_SCOPE
vercel logs <deployment-url-or-id> --json $VERCEL_SCOPE
vercel logs <deployment-url-or-id> --limit 100 $VERCEL_SCOPE
```

Limit log output to a reasonable number of lines (default 100). Use `--follow` only when the user explicitly asks to tail logs.
