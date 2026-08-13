# Personal Engineering Rulebook

Committed reusable reference. This folder is not automatic authority for the project containing it. A project adopts rules only by copying or explicitly linking the relevant files into its own instruction layer.

## Adoption Order

1. Copy `templates/AGENTS.md` into the target project and choose one authority strategy per selected pack: link canonical packs or merge their rules into `AGENTS.md`.
2. Never keep linked and merged copies of the same rules active at once; that creates drift and conflicting authority.
3. Copy `templates/LOCAL_PROJECT_RULES.md`; fill it from the target project's architecture, tooling, and conventions.
4. Copy the relevant pointer templates when those tools are used.
5. Select only required core, domain, technology, and stack packs.
6. Let deeper local instructions override broader portable guidance.

## Packs

- `core/`: durable engineering and collaboration preferences.
- `domains/`: frontend and backend behavior rules.
- `technologies/`: language and framework-specific rules.
- `stacks/`: composition guides for common combinations; they reference canonical packs instead of duplicating them.
- `templates/`: copy-ready project instruction starters.

Use `core/PORTABILITY_FILTER.md` before promoting a project rule into this library.
