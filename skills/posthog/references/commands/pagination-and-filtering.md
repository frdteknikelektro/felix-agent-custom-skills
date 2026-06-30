# Pagination & Filtering

Use this when a PostHog list or query endpoint returns a paginated response or when the user asks for a filtered slice.

- [Cursor pagination](cursor-pagination.md) covers following `next` links across result pages.
- [Time format](time-format.md) covers relative and absolute time windows.
- [Property filters](property-filters.md) covers event and person property filters.
- [Ordering](ordering.md) covers ascending and descending timestamp ordering.

Default to small result sets first. Follow pagination automatically only for small bounded reads; for large result sets, report the remaining page count and ask before continuing.
