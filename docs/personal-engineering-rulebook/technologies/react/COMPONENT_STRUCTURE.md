# React Component Structure

Use with core, frontend, and TypeScript packs.

## Component Style

- Apply these component conventions to project-authored code. Generated or vendor-shaped components follow the generated UI primitive policy from the frontend pack.
- Accept `props`, then destructure inside function body.
- Keep components focused on rendering and composition.
- Keep one primary exported component per file.
- Extract focused hooks or helpers when a component owns mixed effects, browser lifecycle wiring, document mutation, focus or keyboard handling, modal lifecycle, scroll or pointer behavior, or reusable interaction state.
- Extract children that are stateful, independently meaningful, reusable, effect-owning, or domain-aware.
- Tiny stateless private helpers may remain only when they are inseparable from the primary component and extraction would reduce clarity.
- Keep small render-coupled logic local only when it satisfies that private-helper exception.

## Flat Or Foldered

Keep a simple leaf as one file when it has little local state and no meaningful support files.

Promote a component to a feature folder when it gains local hooks, helpers, data, internal children, meaningful orchestration, or likely growth.

```text
feature/
  feature.tsx
  hooks/
  data/
  components/
```

- Keep parent entry component at feature root.
- Add role folders only when they contain real code.
- Keep support code feature-local until reuse crosses feature boundaries.
- Do not create folder-per-file or vague global helper sprawl.
