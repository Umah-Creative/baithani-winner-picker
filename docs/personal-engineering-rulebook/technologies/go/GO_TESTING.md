# Go Testing

Use with core, Go Engineering, and backend packs.

- Keep tests beside owned package code using `_test.go`.
- Test public behavior, domain invariants, authorization, privacy projection, transaction behavior, and transport mapping; avoid mirroring private implementation.
- Use table-driven tests when one behavior has meaningful input cases.
- Prefer small handwritten fakes for narrow interfaces over broad mock machinery.
- Use integration tests with real infrastructure for migrations, constraints, locking, atomicity, idempotency, and concurrent writes when those behaviors matter.
- Use `httptest` for handler decoding, validation, authentication, status mapping, and response contracts.
- Use fuzz tests only where broad input space adds value.
- Run race detection for concurrency-sensitive work when feasible.
- Treat coverage as a diagnostic, not target theater.
