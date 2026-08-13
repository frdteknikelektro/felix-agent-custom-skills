# Delivery Logs and Metrics

Required permission: `read`.

Prefer the current Logs and Metrics APIs for new investigations:

- `POST /v1/analytics/logs` — query inbound/outbound delivery log data.
- `POST /v1/analytics/metrics` — query sending and engagement metrics.
- `POST /v1/analytics/usage/metrics` — query usage metrics.

The legacy endpoints below are still documented but deprecated:

- `GET /v3/{domain_name}/events` — event records, retained for at least three days.
- `GET /v3/{domain_name}/stats/total` — aggregate stats.

Use legacy Events or Stats only when the user specifically needs that endpoint or an existing workflow depends on it. Label the result as legacy/deprecated and prefer the replacement for new work.

## Investigation workflow

1. Confirm domain, region, time window, and event/status filters.
   Completion: the query scope and time zone are explicit.
2. Query Logs for individual message outcomes and delivery details.
   Completion: the response status and pagination/cursor state are captured.
3. Query Metrics for accepted, delivered, failed, opened, clicked, unsubscribed, and complained trends or tag-level analysis.
   Completion: the requested measures and dimensions are returned or the exact API error is captured.
4. Use a returned storage key with `GET /v3/domains/{domain_name}/messages/{storage_key}` only when the user explicitly needs the stored message. Treat message bodies as sensitive.
   Completion: the stored message is retrieved only for the requested key and sensitive content is redacted from output.
5. Distinguish accepted from delivered, temporary failure from permanent failure, and observed data from conclusions.
   Completion: the report labels each observed state and does not infer delivery from acceptance.

For time filters, use the format required by the endpoint. Mailgun commonly accepts RFC-2822 dates or Unix epoch values; Events uses epoch seconds for `begin` and `end`. Do not silently change the requested timezone or time window.

## Output

Report the exact time window, domain, filters, counts, and any pagination/cursor state. Mask recipient addresses and omit message bodies unless necessary to answer the request. Never present an aggregate as proof that every message was delivered.

Official references: [Logs](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/logs), [Events](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/events/get-v3-domain_name-events), and [API overview](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview).
