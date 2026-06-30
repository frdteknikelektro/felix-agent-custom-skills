# SSL Certificates

**List certificates** (`vercel.read`):

```bash
vercel certs ls $VERCEL_SCOPE
```

**Issue a certificate** (`vercel.write`):

```bash
vercel certs issue <cn> [domains...] $VERCEL_SCOPE
```

**Remove a certificate** (`vercel.write`):

```bash
vercel certs rm <cn> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.
