# React Component Structure

Use with core, frontend, and TypeScript packs.

## Component Style

- Apply these component conventions to project-authored code. Generated or vendor-shaped components follow the generated UI primitive policy from the frontend pack.
- Accept `props`, then destructure inside function body.
- Keep components focused on rendering and composition.
- Extract focused hooks or helpers when a component owns mixed effects, browser lifecycle wiring, document mutation, focus or keyboard handling, modal lifecycle, scroll or pointer behavior, or reusable interaction state.
- Keep small render-coupled logic local when extraction adds no useful boundary.

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
