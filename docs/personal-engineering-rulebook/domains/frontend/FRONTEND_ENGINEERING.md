# Frontend Engineering

Use with the core pack. Add technology packs only when relevant.

## Boundaries

- Keep route and screen entrypoints focused on composition and coordination.
- Keep data access, transport adaptation, and unstable response normalization outside presentational components.
- Group feature-local behavior with the feature; promote code outward only after real cross-feature reuse.
- Keep design-system primitives free from domain behavior.

## Generated UI Primitives

- Treat generated UI primitives, including shadcn/ui components, as vendor-shaped project source.
- Preserve upstream internal structure and style by default; do not mechanically rewrite generated code to satisfy personal formatting or component conventions.
- Apply personal engineering conventions fully to project-authored components and composition code.
- Modify generated primitives only for an explicit product-design, accessibility, behavior, integration, or verified-defect requirement.
- Keep deliberate generated-code deviations narrow and review them again when regenerating or upgrading the primitive.

## User Experience

- Make routine actions direct; reveal advanced detail progressively.
- Design responsive behavior around content and task needs, not device labels.
- Do not squeeze a dense desktop interaction into an unusable narrow layout; use a different primary layout when needed.
- Every meaningful operation communicates idle, pending, success, failure, conflict, or offline state.
- Keep valid content visible during background refresh.
- Disable only affected controls during mutation when safe.
- Preserve useful user state after failure; provide retry only when retry remains valid.
- Use action-specific success and error feedback. Put field errors near their fields.
- Treat irreversible or high-impact actions as explicit confirmation flows; prefer auditable correction over silent erasure.

## Accessibility

- Use semantic structure, visible focus, keyboard access, programmatic labels, and sufficient contrast.
- Never use color as the only carrier of status or meaning.
- Move focus predictably for dialogs and route changes; restore it after dialog close.
- Keep touch targets practical, controls discoverable, and text resilient to expansion.
- Announce status changes without stealing focus.
- Respect reduced-motion preferences; motion must not be required to understand state.
