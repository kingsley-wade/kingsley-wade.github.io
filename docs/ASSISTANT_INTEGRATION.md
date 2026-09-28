# Personal Assistant Integration

## Boundary

The GitHub Pages site is public and static. It publishes read-only profile data
at `/api/v1/content.json` and may call a separately deployed HTTPS assistant
gateway when `PUBLIC_ASSISTANT_API_BASE_URL` is configured. The static build,
browser bundle, public JSON and local terminal must never contain private notes,
database credentials, model keys or long-lived owner tokens.

Without a configured gateway, the site shows
`assistant: offline / not configured`, renders no chat input and sends no
assistant request. The homepage, terminal and local interactions remain usable.

## Public Visitor API

The optional gateway exposes:

```text
GET  /v1/health
POST /v1/public/query
```

`GET /v1/health` returns `{ "status": "ok", "version": "1.0" }`.
`POST /v1/public/query` accepts `{ "query": "..." }` and returns an answer
plus public source records. The browser adapter times out after eight seconds,
validates the response shape and normalizes HTTP, JSON and network failures.
This public route may only answer from already public material.

## Owner Authentication

The future gateway uses OIDC Authorization Code with PKCE:

1. The browser creates a random verifier, derives `S256` challenge and starts
   login with an allowlisted redirect URI.
2. The identity provider returns a one-time authorization code.
3. The browser exchanges the code and verifier through the gateway for a
   short-lived access token whose audience is the notes API.
4. The token stays in memory. It is not written to localStorage, cookies that
   JavaScript can read, repository files, build artifacts or URLs.
5. Logout or expiry clears the token. Refresh requires a new authorized flow
   or a gateway-managed rotating session with `HttpOnly`, `Secure`, `SameSite`
   cookies.

The required scopes are:

| Scope | Operations |
| --- | --- |
| `notes:read` | Search notes and summarize selected notes |
| `notes:write` | Create and update notes |
| `notes:archive` | Archive a note |

Every owner route verifies issuer, audience, expiry, subject and required
scope. The owner subject must match the gateway's configured owner identity.

## Owner Notes API

All routes use `Authorization: Bearer <short-lived-token>` and JSON. IDs are
opaque; archived notes are excluded from search unless explicitly requested.

| Method and route | Scope | Request |
| --- | --- | --- |
| `GET /v1/owner/notes?query=...&cursor=...` | `notes:read` | Query parameters |
| `POST /v1/owner/notes` | `notes:write` | `{ "title", "body", "tags"? }` |
| `PATCH /v1/owner/notes/{id}` | `notes:write` | Any non-empty subset of title/body/tags |
| `POST /v1/owner/notes/{id}/archive` | `notes:archive` | Empty object |
| `POST /v1/owner/notes/summarize` | `notes:read` | `{ "noteIds": ["note_..."] }` |

The matching TypeScript boundary is `OwnerNotesAdapter` in
`src/lib/assistant/contracts.ts`. It covers search, create, update, archive and
summarize without choosing a database or model provider.

### Success

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "note_example",
    "title": "Reading note",
    "body": "Public-free private content stays on the gateway.",
    "tags": ["reading"],
    "excerpt": "Public-free private content...",
    "createdAt": "2026-09-28T12:00:00Z",
    "updatedAt": "2026-09-28T12:00:00Z",
    "archived": false
  },
  "requestId": "req_example"
}
```

### Unauthorized

```http
HTTP/1.1 401 Unauthorized

{"error":{"code":"unauthorized","message":"Valid owner token required","requestId":"req_example"}}
```

### Forbidden

```http
HTTP/1.1 403 Forbidden

{"error":{"code":"forbidden","message":"Missing scope: notes:archive","requestId":"req_example"}}
```

### Validation

```http
HTTP/1.1 422 Unprocessable Entity

{"error":{"code":"validation-error","message":"Request validation failed","requestId":"req_example","details":{"title":["Required"]}}}
```

### Timeout

```http
HTTP/1.1 504 Gateway Timeout

{"error":{"code":"timeout","message":"Upstream assistant timed out","requestId":"req_example"}}
```

## CORS and Audit

The gateway allowlists the exact production origin and explicit local
development origins. It permits only required methods and headers, returns
`Vary: Origin`, rejects wildcard origins for authenticated requests and does
not expose tokens in responses or logs.

Every owner operation records a `NotesAuditEvent`: request ID, owner subject,
action, affected note IDs, timestamp and allowed/denied/failed outcome. Audit
records must omit note bodies, authorization headers and model prompts. The
gateway applies request-size limits, rate limits and structured validation
before storage or model calls.

## Future Deployment

Deploy the gateway to a VPS or managed HTTPS runtime, configure its CORS origin
to the final site URL, then set only `PUBLIC_ASSISTANT_API_BASE_URL` in the site
build. Private gateway settings belong in the gateway's secret manager or
server environment and must never use a `PUBLIC_` prefix.
