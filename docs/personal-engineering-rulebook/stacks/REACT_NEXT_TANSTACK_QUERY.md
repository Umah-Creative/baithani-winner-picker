# React, Next, And TanStack Query

Use only when all three technologies fit target project.

## Compose These Packs

1. `core/PERSONAL_ENGINEERING_STYLE.md`
2. `core/AGENT_COLLABORATION.md`
3. `domains/frontend/FRONTEND_ENGINEERING.md`
4. `technologies/typescript/TYPESCRIPT_STYLE.md`
5. `technologies/typescript/FILE_NAMING.md`
6. `technologies/react/COMPONENT_STRUCTURE.md`

## Stack Additions

- Keep route files as orchestration layers; do not place large domain logic in pages or layouts.
- Prefetch only data needed to improve initial render correctness or user experience.
- Parse and normalize search parameters in focused typed helpers.
- For non-trivial query domains, keep query keys and query options in one discoverable domain definition.
- Reuse that definition for queries, prefetching, mutations, and invalidation.
- Keep invalidation close to the mutation that needs it; avoid scattered cache wrappers and duplicated inline options.
- Keep API access and response normalization outside components.
- Use client-only loading strategically for heavy browser-only code, not by default.
