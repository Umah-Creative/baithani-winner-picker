# Personal Engineering Style

Technology-neutral durable preferences.

## Scope And Decisions

- Stay inside requested scope.
- Treat analysis, review, and explanation as read-only until edits are explicitly requested.
- Surface contradictions affecting integrity, authorization, privacy, money, deployment, or scope before implementation.
- Do not implement future capability merely because architecture could support it.
- Prefer minimal, behavior-preserving change.
- Do not add adjacent cleanup, abstraction, or architectural churn without clear task value.

## Structure

- Prefer thin orchestrators that compose focused collaborators.
- Keep ownership easy to trace from names and location.
- Keep stable domain rules in one clear source of truth.
- Extract focused helpers before adding wrapper layers.
- Keep tiny, tightly coupled logic local when extraction adds ceremony without clarity or safety.
- Prefer explicit dependencies and composition over magical indirection.
- Prefer local duplication over premature shared abstraction when ownership is unclear.
- Shared code must earn its boundary through reuse, clarity, or enforcement.

## Change Discipline

- Inspect existing local changes before editing affected files.
- Preserve local architecture and naming unless task changes them.
- Do not rewrite unrelated code to match personal taste.
- Improve touched legacy code only enough to meet current task standard.
- Use non-destructive version-control actions by default. Do not discard or rewrite history without explicit approval.

## Verification Honesty

- Verify touched work when feasible.
- Report what was checked, what was not checked, and why.
- Do not claim runtime, visual, integration, or deployment verification without evidence.
- Evidence precedes completion claims.
