# DNS Records

**List DNS records** (`vercel.read`):

```bash
vercel dns ls <domain> $VERCEL_SCOPE
```

**Add a DNS record** (`vercel.write`):

```bash
vercel dns add <domain> <subdomain> <type> <value> $VERCEL_SCOPE
```

**Remove a DNS record** (`vercel.write`):

```bash
vercel dns rm <record-id> $VERCEL_SCOPE --yes
```

This is destructive. Only run when the user explicitly asks.
