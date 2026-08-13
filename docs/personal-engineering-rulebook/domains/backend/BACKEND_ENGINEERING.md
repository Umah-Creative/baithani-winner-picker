# Backend Engineering

Use with the core pack. Add language or framework packs only when relevant.

## Boundaries

- Keep transport handlers thin: decode, validate transport input, obtain actor context, call a use case, map known results, encode response.
- Keep authorization, domain validation, transactions, persistence, and privacy projection in focused owning layers.
- Keep dependencies explicit and acyclic.
- Keep project-specific transport and infrastructure adaptation at the boundary.
- Use explicit operations instead of generic catch-all persistence APIs when domain behavior matters.

## API And Data Integrity

- Validate untrusted input at the boundary and keep domain invariants enforced server-side.
- Use stable API error codes; never expose raw storage errors or internal traces to clients.
- Assess compatibility before changing externally consumed contracts.
- Treat multi-step state changes as atomic when partial completion would corrupt data.
- For retry-sensitive mutations, design idempotency and concurrency behavior deliberately.
- Prefer correction or void flows with audit evidence over silent deletion for consequential records.

## Security And Audit

- Enforce authorization server-side; never trust client role claims.
- Scope data access to the authenticated actor and authorized boundary.
- Expose privacy-safe projections, not broad records filtered by the client.
- Redact credentials, tokens, cookies, secrets, and sensitive payloads from logs and audit records.
- Keep operational logs and audit trails separate: reliability diagnostics are not change history.
- Make audit events attributable, time-bound, and sufficient to reconstruct consequential changes.
- Test authorization, privacy boundaries, idempotency, concurrency, and atomic rollback where applicable.
