# Baithani Winner Picker

Next.js winner picker for Baithani doorprize events, with a minimal password-protected admin for live-editing the logo, SEO tags, range, exclusions, and accent color.

## Stack

- Next.js 16 App Router + TypeScript 5
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL
- `jose` for signed admin cookies
- Web Audio API + canvas-confetti for the reveal

## Setup

Use `pnpm` and Node 22.

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSWORD` — password for `/admin/login`
- `ADMIN_SECRET` — signing secret for the admin session cookie

Run migrations and seed the default event row:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the dev server:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` — start development server
- `pnpm build` — production build
- `pnpm start` — serve production build
- `pnpm lint` — ESLint
- `pnpm db:generate` — generate Drizzle migrations from schema changes
- `pnpm db:migrate` — apply migrations
- `pnpm db:seed` — insert default event settings row if missing

## Admin

- `/admin` — protected settings dashboard
- `/admin/login` — shared-password login

## Deploy

The Docker image runs migrations + seed on startup before starting the Next server. Dokploy should set `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SECRET` as environment variables.

```bash
docker build -t baithani-winner-picker .
docker run --env-file .env.local -p 3000:3000 baithani-winner-picker
```
