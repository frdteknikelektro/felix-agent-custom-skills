# Build a workspace project without deploying

```bash
export VERCEL_TOKEN="$VERCEL_TOKEN"
cd <project-directory>
vercel whoami
vercel link
vercel build --prod
```
