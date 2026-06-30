# Cursor Pagination

PostHog uses cursor-based pagination. The response includes a `next` field with the full URL for the next page (or `null` if no more pages). Follow it directly:

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "{next_url_from_response}"
```

Do not construct your own cursor values — always use the provided `next` URL.
