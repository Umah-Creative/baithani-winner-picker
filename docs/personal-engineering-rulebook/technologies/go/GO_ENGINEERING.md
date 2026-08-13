# Go Engineering

Use with core and backend packs.

## Package Design

- Package by cohesive domain or capability, not global technical layer.
- Use short, lowercase, meaningful package names.
- Keep domain ownership visible; avoid application-wide controller, service, repository, model, helper, or utility dumping grounds.
- Keep composition root limited to configuration, wiring, startup, and shutdown. Business rules do not belong there.
- Use explicit, searchable file names when package owns several flows. Do not create files before their responsibility exists.

## Dependencies

- Keep dependency direction explicit and acyclic.
- Keep handlers thin, application services focused on one use case, and repositories focused on persistence.
- Define interfaces near consumers; keep them narrow.
- Add an interface only for real substitution, testing, implementation variation, or a meaningful boundary.
- Use constructor injection. Avoid globals and service locators.
- Do not add generic repositories, an interface for every concrete type, or a pseudo-object-oriented layer.

## Boundaries

- Pass `context.Context` first for request-bound work; do not store it on long-lived structs or use it as a parameter bag.
- Keep generated row types internal when domain behavior, privacy, or transport shape requires conversion; do not map every record by ritual.
- Load and validate typed configuration at startup. Do not read environment values throughout domain packages.
- Use integer representations for money or other exact quantities; never floating point where precision is consequential.
