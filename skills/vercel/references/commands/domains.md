# Domains

**List domains** (`vercel.read`):

```bash
vercel domains ls $VERCEL_SCOPE
vercel domains inspect <domain> $VERCEL_SCOPE
```

**Add a domain** (`vercel.write`):

```bash
vercel domains add <domain> $VERCEL_SCOPE
```

**Remove a domain** (`vercel.write`):

```bash
vercel domains rm <domain> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.

**Buy a domain** (`vercel.write`):

```bash
vercel domains buy <domain> $VERCEL_SCOPE
```

**Move a domain** (`vercel.write`):

```bash
vercel domains move <domain> $VERCEL_SCOPE
```

**Transfer a domain in** (`vercel.write`):

```bash
vercel domains transfer-in <domain> $VERCEL_SCOPE
```

**Verify a domain** (`vercel.write`):

```bash
vercel domains verify <domain> $VERCEL_SCOPE
```
