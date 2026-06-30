# Pull env vars to local .env file

```bash
export VERCEL_TOKEN="$VERCEL_TOKEN"
vercel whoami
vercel env pull .env.local --environment=production
```
