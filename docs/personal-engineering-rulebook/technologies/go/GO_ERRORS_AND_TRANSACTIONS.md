# Go Errors And Transactions

Use with Go Engineering and backend packs.

## Transactions

- Application service owns transaction boundary when one use case spans collaborators.
- Pass same transaction-bound query capability to every participating persistence operation.
- Repositories must not independently commit pieces of a larger use case.
- Lock affected records before calculating and validating shared mutable state; use stable lock ordering for multi-record work.
- Make retry behavior and idempotency explicit where duplicate mutation is harmful.
- Test rollback, concurrent mutation, and correction behavior for consequential flows.

## Errors

- Use sentinel or typed errors for expected domain outcomes.
- Wrap unexpected errors with operation context using `%w`.
- Use `errors.Is` and `errors.As`; never branch on error text.
- Map domain errors centrally to stable transport codes and safe messages.
- Keep storage errors and implementation details out of client responses.
- Inject a clock when current time changes business behavior; pass explicit time to deterministic calculations.
