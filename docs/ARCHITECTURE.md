# Architecture

Baithani Winner Picker is a Next.js App Router application organized by feature ownership. Routes authenticate, load data, and compose feature entrypoints; server-only feature modules own persistence and request adaptation.

## Runtime and feature boundaries

```mermaid
flowchart TB
  subgraph Edge["Dokploy edge"]
    Traefik["Traefik TLS + forwarded-header sanitation<br/>optional configured rate limit"]
  end
  subgraph App["Next.js application"]
    Proxy["proxy.ts trust boundary"]
    Routes["App Router pages and routes"]
    Auth["admin-auth"]
    Shell["admin-shell"]
    Settings["event-settings"]
    Sharing["event-sharing"]
    Audit["audit-log"]
    Picker["picker"]
    Shared["shared policy modules"]
  end
  Database[("PostgreSQL")]

  Traefik --> Proxy --> Routes
  Routes --> Shell
  Routes --> Auth
  Routes --> Settings
  Routes --> Audit
  Routes --> Picker
  Routes --> Sharing
  Auth --> Audit
  Settings --> Audit
  Settings --> Database
  Audit --> Database
  Shared --> Proxy
  Shared --> Settings
  Shared --> Picker
```

- `src/app` contains thin framework boundaries.
- `src/features` owns domain UI, hooks, client-safe contracts, server queries, commands, and services.
- `src/shared` contains only proven cross-feature policy: brand, draw-pool limits, request context, security, and site URL resolution.
- `src/components` contains shared layout, theme, and generated UI primitives.
- `src/lib/utils.ts` remains the generated shadcn `cn` boundary.

## Authenticated settings transaction

```mermaid
sequenceDiagram
  actor Admin
  participant Action as Event settings action
  participant Auth as Admin session
  participant Command as Settings command
  participant DB as PostgreSQL transaction

  Admin->>Action: Submit FormData
  Action->>Auth: Verify signed admin session
  alt Unauthorized
    Action-->>Admin: Safe denied state
  else Authorized
    Action->>Action: Parse transport and validate input
    Action->>Command: Validated settings + audit context
    Command->>DB: Read previous settings
    Command->>DB: Upsert canonical settings
    Command->>DB: Insert settings/logo audit events
    alt Any write fails
      DB-->>Command: Roll back transaction
      Command-->>Action: Safe save failure
    else Transaction commits
      DB-->>Command: Canonical committed row
      Command-->>Action: EventSettingsView
      Action-->>Admin: Success with canonical state
    end
  end
```

## Reverse-proxy trust boundary

```mermaid
sequenceDiagram
  participant Client
  participant Traefik
  participant Proxy as Next.js proxy.ts
  participant App as Server component/action
  participant Audit as Audit persistence

  Client->>Traefik: HTTPS request + untrusted headers
  Traefik->>Traefik: Sanitize forwarded headers; apply configured rate limit
  Traefik->>Proxy: Trusted X-Forwarded-For chain
  Proxy->>Proxy: Select configured right-side hop
  Proxy->>Proxy: Generate request ID and CSP nonce
  Proxy->>App: Overwritten internal attribution headers
  App->>Audit: Bounded client IP, request ID, agent, language
  Proxy-->>Client: Security headers + X-Request-ID
```

Production assumes one direct Dokploy Traefik hop (`TRUST_PROXY_HOPS=1`) that sanitizes forwarded headers, plus one application replica. Traefik owns TLS/HSTS. It owns the recommended global token bucket only after the operator applies the documented Dokploy configuration; the repository cannot enable or verify that edge control. The application owns request attribution, CSP, sessions, authorization, validation, transactions, and privacy-safe audit projection.
