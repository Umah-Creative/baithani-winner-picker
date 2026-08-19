# File Naming

Use names that show ownership and role quickly.

## Role Suffixes

Use a role suffix when it materially clarifies support-file purpose:

- `*.type.ts`
- `*.util.ts`
- `*.service.ts`
- `*.schema.ts`
- `*.factory.ts`
- `*.keys.ts`
- `*.options.ts`
- `*.normalizer.ts`
- `*.columns.ts`
- `*.constant.ts`
- `*.config.ts`
- `*.action.ts` for server-action modules
- `*.server.ts` when a server-only boundary needs to be visible in the filename

Do not invent or force suffixes for symmetry.

## Conventions

- Use kebab-case for project-authored source and test filenames.
- Keep exported React component symbols in PascalCase; a PascalCase symbol does not justify a PascalCase filename.
- Keep framework-reserved file names unchanged.
- Keep hooks in their conventional `use-*` form.
- Keep feature-local domain helpers beside their owning feature; do not promote
  them to shared modules without proven cross-feature reuse.
- Use singular names for one entity and plural names for collections or grouped exports.
- Prefer explicit feature entry names over `index` when ownership would otherwise be hidden.
- Avoid generic dumping-ground names such as `helpers`, `utils`, or `types` when a domain name can be used.
- Avoid broad barrels when they obscure ownership or create accidental coupling.

## Exceptions

Keep established naming when an external contract owns the filename:

- Framework-required files such as Next.js `page.tsx`, `layout.tsx`, `route.ts`, and metadata conventions.
- Generated shadcn primitives and other generated or vendor-shaped code.
- Generated database migrations and their metadata.
- Static assets whose published paths are compatibility contracts.
- Root tooling conventions such as `Dockerfile`, `README.md`, and `package.json`.
- Governance conventions such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.

Treat exceptions narrowly. Existing inconsistency is not a reason to create another exception.
