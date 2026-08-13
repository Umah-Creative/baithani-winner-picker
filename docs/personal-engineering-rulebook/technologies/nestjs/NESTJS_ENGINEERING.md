# NestJS Engineering

Use with core, backend, and TypeScript packs.

- Organize by feature module with cohesive controllers, providers, DTOs, and tests.
- Keep controllers thin: request binding, DTO validation, guard-provided actor context, one focused use-case call, and response mapping.
- Keep providers focused on one cohesive responsibility; do not build god services.
- Use constructor injection and explicit module providers. Avoid service locators and hidden global dependencies.
- Validate DTOs through pipes at the transport boundary; keep domain rules in owning providers or domain code.
- Use guards for authentication and authorization entry checks; still enforce sensitive ownership and scope in use-case logic.
- Use exception filters or centralized mapping for consistent safe error responses.
- Load typed configuration once and validate it during startup; do not scatter configuration reads.
- Test controllers, providers, guards, and boundary behavior at a scope matching risk.

Repository layers, domain events, caching, queues, JWT, and microservices are optional tools. Adopt each only for a demonstrated requirement and keep its boundary explicit; none is a blanket mandate.
