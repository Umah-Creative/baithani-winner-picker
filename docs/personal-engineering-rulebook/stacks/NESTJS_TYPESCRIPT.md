# NestJS And TypeScript

Use only for NestJS projects written in TypeScript.

## Compose These Packs

1. `core/PERSONAL_ENGINEERING_STYLE.md`
2. `core/AGENT_COLLABORATION.md`
3. `domains/backend/BACKEND_ENGINEERING.md`
4. `technologies/typescript/TYPESCRIPT_STYLE.md`
5. `technologies/typescript/FILE_NAMING.md`
6. `technologies/nestjs/NESTJS_ENGINEERING.md`

## Stack Additions

- Keep DTO validation at transport boundary and map DTOs to use-case input when transport shape should not leak inward.
- Keep module wiring explicit and feature-owned.
- Keep generated clients, transport adapters, and infrastructure integrations outside domain logic.
- Add repository layers, events, caching, queues, JWT, or microservices only where the project has a demonstrated boundary or operational requirement.
