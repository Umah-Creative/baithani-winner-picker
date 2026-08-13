# Portability Filter

Use this before adding a rule to this library.

## Rule Homes

### Personal Core

Durable preferences across unrelated work: scope discipline, thin orchestration, explicit ownership, cautious abstraction, and verification honesty.

### Domain Pack

Rules for a kind of work that remain useful across many projects, such as frontend interaction behavior or backend security boundaries.

### Technology Pack

Rules that depend on a language, framework, or library and remain useful across projects using that technology.

### Stack Pack

Rules that compose selected domain and technology packs for a common combination. Keep these narrow; reference canonical packs instead of repeating them.

### Local Project Rules

Rules based on project-specific architecture, directories, transports, permissions, deployment, package tools, data shape, or team workflow.

## Rewrite Test

Remove project nouns and exact implementation facts.

- If rule remains precise and broadly useful, place it in core or relevant pack.
- If rule becomes vague, false, or needs exact local context, keep it local.
- If uncertain, keep it local first. Promote only after repeated, stable use.

## Guardrails

- Do not turn one project's workaround into universal instruction.
- Do not make optional architecture a blanket mandate.
- Keep stack rules conditional.
- Keep reusable rules narrow enough to be hard to misuse.
