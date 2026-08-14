# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a Baithani media or event-committee volunteer operating the picker live while a church-event audience watches on a projector or LED display. Event organizers also use the protected admin before the event to prepare its identity and draw rules.

## Product Purpose

Baithani Winner Picker runs fair, legible doorprize draws for Baithani events. Success means one operator can configure an event, build suspense, reveal an unmistakable winner, and continue drawing without duplicates or operational confusion.

## Positioning

This is a reusable internal Baithani event tool rather than a generic winner-picker service. It combines event-specific Baithani identity and admin-managed settings with a projector-first live operating flow and visible Multimedia Baithani maker credit.

## Operating Context

- Organizers configure the title, description, logo, accent color, draw range, and excluded numbers before an event.
- A media volunteer operates the public stage with its primary button or Space key while an audience watches the shared display.
- Draw history persists in the operator's browser for the event session and supports undo and protected clearing.
- The public stage supports light and dark environments, fullscreen presentation, sound muting, and mobile operation as a secondary use case.

## Capabilities and Constraints

- The public flow is `Start draw` → `Reveal winner` → `Draw next winner`.
- Drawn and excluded numbers cannot win again within the active browser history.
- Valid draw ranges use whole numbers with `1 ≤ min < max ≤ 10,000`.
- Event settings are stored in one PostgreSQL `event_settings` record; draw history stays local to the browser.
- Admin access uses a shared password and signed cookie.
- The public interface is English.
- Project stack and deployment remain Next.js, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, pnpm, and Node 22.

## Brand Commitments

- The uploaded event logo and title lead the event identity.
- Baithani's recognizable pink and plum character remains present across themes while the configured accent color adapts display and control contrast.
- Multimedia Baithani receives readable maker credit without competing with the winner.
- Product voice is energetic, direct, human, and suitable for a live church event; avoid generic promotional or AI-sounding prose.

## Evidence on Hand

- Current and historical Baithani logos are stored in `public/logos/`.
- The previous static implementation remains in `legacy/` as behavioral and historical reference.
- The repository contains the real public picker, protected admin, event-settings schema, and deployment configuration.
- No testimonials, audience metrics, fairness certifications, or external product claims are available and must not be fabricated.

## Product Principles

1. The winner must own the room.
2. One operator action should always have one obvious outcome.
3. Celebration should feel generous without making the stage unstable or exhausting.
4. Event identity and maker credit should be recognizable without overpowering the draw.
5. Live-event safeguards matter more than configuration cleverness.

## Accessibility & Inclusion

- Preserve keyboard operation, visible focus, screen-reader winner announcements, and practical touch targets.
- Respect reduced-motion preferences by removing rapid number cycling, impact motion, smooth history scrolling, and confetti.
- Maintain readable contrast and projector-scale type in both light and dark themes.
