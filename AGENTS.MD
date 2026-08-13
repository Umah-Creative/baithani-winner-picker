# Agent Rules

## Precedence

1. User request and deeper local instructions override this file.
2. This file selects reusable packs and records project-local truth.
3. The selected canonical pack documents are authority for their own rules.

## Rulebook Strategy

**Link** — the canonical documents live at `docs/personal-engineering-rulebook/` and are the single source of truth. Do not maintain merged copies of these same rules in this file.

## Linked Canonical Packs

- `docs/personal-engineering-rulebook/core/PERSONAL_ENGINEERING_STYLE.md`
- `docs/personal-engineering-rulebook/core/AGENT_COLLABORATION.md`
- `docs/personal-engineering-rulebook/core/PORTABILITY_FILTER.md`
- `docs/personal-engineering-rulebook/domains/frontend/FRONTEND_ENGINEERING.md`
- `docs/personal-engineering-rulebook/domains/backend/BACKEND_ENGINEERING.md`
- `docs/personal-engineering-rulebook/technologies/typescript/TYPESCRIPT_STYLE.md`
- `docs/personal-engineering-rulebook/technologies/typescript/FILE_NAMING.md`
- `docs/personal-engineering-rulebook/technologies/react/COMPONENT_STRUCTURE.md`

The `stacks/REACT_NEXT_TANSTACK_QUERY.md` pack is not adopted because this project does not use TanStack Query.

## Project-Local Rules

- Package manager: pnpm
- Node version: 22
- Framework: Next.js 16 App Router
- Language: TypeScript 5 (strict)
- Styling: Tailwind CSS v4
- Path alias: `@/*` -> `./src/*`
- Persistence: Postgres via Drizzle ORM; single `event_settings` table
- Admin auth: `ADMIN_PASSWORD` env + `jose`-signed cookie
- Data access lives in server components and server actions; presentational components stay transport-free
- Feature-local code stays feature-local until reuse crosses feature boundaries

## Verification Commands

- `pnpm lint`
- `pnpm build`
- `pnpm dev`
