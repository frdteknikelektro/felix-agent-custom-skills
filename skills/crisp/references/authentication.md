# Crisp authentication and transport

Use this reference before the first Crisp request or when a request fails because of credentials, token tier, scope, quota, or rate limits.

## Authentication

Crisp REST API requests use a token keypair with HTTP Basic Auth plus the matching `X-Crisp-Tier` header:

| Token tier | Header | Scope | Official quota guidance |
| --- | --- | --- | --- |
| `website` | `X-Crisp-Tier: website` | One workspace, where the token was generated | 10,000 requests/day |
| `plugin` | `X-Crisp-Tier: plugin` | Multiple installed workspaces, subject to plugin scopes | 5,000 requests/day by default; configurable |

Use the bundled `scripts/crisp_api.py` transport instead of assembling headers in each request. It generates Basic Auth without putting the keypair in the URL and adds the required Crisp tier header. Keep both token values secret. A plugin token’s existence does not grant every route: check the route’s required Crisp scope in the official reference.

```sh
python3 skills/crisp/scripts/crisp_api.py \
  GET "/v1/website/$CRISP_WEBSITE_ID"
```

`CRISP_WEBSITE_ID` is the exact workspace boundary for every website-scoped route. Never derive it from a display name or domain. URL-encode it and other path/query values when they come from user input.

## Response and retry handling

Crisp responses commonly expose an envelope with `error`, `reason`, and `data`. Report the HTTP status and redacted `reason`; treat `error: true` as failure even if the transport request completed.

The API can return `429 Too Many Requests` or `420 Enhance Your Calm`. Use bounded backoff and respect the route’s limit. `GET` and `HEAD` routes may be served from Crisp’s cache, so a cached read is not proof that a just-written mutation has propagated. Re-read a changed object when verification matters.

The script retries reads with bounded backoff for explicit `420`/`429` responses. It does not retry mutations by default; use `--retry-mutations` only after a deliberate retry decision for a known `420`/`429`. Do not blindly retry a message send, campaign dispatch, profile export, or other mutation after an ambiguous timeout. First check whether Crisp returned an identifier or whether a safe read can determine whether the mutation took effect.

## Official sources

- [Crisp REST API reference](https://docs.crisp.chat/references/rest-api/v1/)
- [REST API authentication overview](https://docs.crisp.chat/guides/rest-api/authentication/)
- [Website token authentication](https://docs.crisp.chat/guides/rest-api/authentication/website-token/)
- [Plugin token authentication](https://docs.crisp.chat/guides/rest-api/authentication/plugin-token/)
- [REST API rate limits](https://docs.crisp.chat/guides/rest-api/rate-limits/)

Completion: the token tier, exact workspace, auth headers, route scope, and retry posture are resolved without exposing credentials.
