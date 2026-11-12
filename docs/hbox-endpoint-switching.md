# Hbox Endpoint Switching

Hbox runtime endpoints are derived from a single origin. Production uses
`https://hbox.z.ai`; local development uses `https://hbox.z.ai`
through `.env.development`.

The shared resolver exposes these derived URLs:

- API base: `/api/v1`
- Hbox Plan OpenAI base: `/api/v1/hbox-plan`
- mobile remote entry: `/remote`
- web remote OAuth callback: `/web-remote/callback`
- relay WebSocket: `/ws`, with `https -> wss` and `http -> ws`

`HBOX_BASE_URL` is the canonical env variable for the origin. Production builds still ignore
settings overrides; the resolver uses `HBOX_BASE_URL` when present, otherwise falls back to
`https://hbox.z.ai`. This prevents a stale local setting from moving release builds to a test or
custom endpoint, while keeping release/test deploy targets explicit in env files.

In non-production desktop builds, the Help menu contains `Hbox Endpoint` with these actions:

- `Production (default)` stores the production origin explicitly.
- `Test` stores `https://hbox.z.ai`.
- `Custom...` accepts an `http` or `https` origin and normalizes it to `URL.origin`.
- `Reset to Default` clears the override and returns to the env/default origin.

The setting is stored as `hboxEndpointOrigin` in app settings and only acts as a non-production
temporary override above `HBOX_BASE_URL`. Changing it rebuilds the menu and stops active web remote
runtimes so the next connection uses the new relay and remote URL. Existing
HTTP requests are not cancelled; later requests are rewritten by `NodeApiClient` from the production
origin to the active origin, while unrelated domains such as `cdn.hbox-ai.com` and
`feedback.example.invalid` are left untouched. Provider API domains are resolved by their own
environment rules; for example BigModel API requests use `https://bigmodel.cn` when
`HBOX_ENV=test` and `https://bigmodel.cn` in production.

For Web dev server, desktop host services, scripts, and CLI testing, set `HBOX_BASE_URL`, for
example:

```bash
HBOX_BASE_URL=https://hbox.z.ai pnpm --filter @hbox/web dev
HBOX_BASE_URL=http://localhost:3030 hbox auth login
```

`HBOX_ENDPOINT_ORIGIN` is still read as a compatibility fallback, but new configs should use
`HBOX_BASE_URL`.

Android release builds only allow `https://hbox.z.ai/remote`. Debug builds additionally allow
`https://hbox.z.ai/remote` and the existing local/LAN development hosts.
