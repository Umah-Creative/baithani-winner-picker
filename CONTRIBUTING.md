# Contributing

Contributions are welcome when they preserve the event workflow, accessibility, and security boundaries.

## Before starting

1. Search existing issues and discussions.
2. Open a feature request before large product or architecture changes.
3. Keep Baithani brand assets out of derivative work unless you have separate permission; see [BRAND_ASSETS.md](BRAND_ASSETS.md).

## Development

Use Node.js 22 and pnpm 11.21.0.

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev:portless
```

`pnpm dev:portless` is recommended for a stable named local URL and parallel worktrees. Clear any local `SITE_URL=http://localhost:3000` override so `PORTLESS_URL` can be used.

## Pull requests

- Keep changes focused and use Conventional Commits.
- Add behavior-first tests for fixes and features.
- Keep project-authored source and test filenames in kebab-case.
- Do not include generated secrets, local databases, or Baithani brand derivatives.
- Run:

  ```bash
  pnpm test
  pnpm prettier
  pnpm lint
  pnpm check-type
  pnpm build
  pnpm audit --prod --audit-level high
  ```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the [personal engineering rulebook](docs/personal-engineering-rulebook/) before moving feature ownership or shared boundaries.
