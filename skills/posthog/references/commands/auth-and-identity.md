# Auth & Identity

**Verify current user** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/users/@me/"
```

Returns the authenticated user, their organizations, and project access. Use this as a smoke test before any work.
