# CLAUDE.md

Guidance for working in **FindCards Business Management** — an admin/user portal for
managing businesses, referrals, categories, prizes and credits.

## Project Skills

This repo ships project-scoped skills under `.claude/skills/`. They encode the exact
conventions used here and are **loaded directly** into context via the imports below:

- **`design-system`** — Tailwind v4 + shadcn/ui (new-york) tokens, OKLCH theming, the
  custom `Input`/`CustomButton`/`Container`/`Spinner` wrappers, and component conventions.
- **`folder-structure`** — where everything lives (`app/`, `components/`, `service/`,
  `supabase/db/`, `config/`, `lib/`, `helpers/`) and how routing/role areas are organized.
- **`api-patterns`** — Supabase clients (browser / server / service-role), the
  `supabase/db/*` mutation layer, RSC data fetching, route handlers + response helpers,
  middleware auth, and storage/image handling.

@.claude/skills/design-system/SKILL.md
@.claude/skills/folder-structure/SKILL.md
@.claude/skills/api-patterns/SKILL.md

## Stack

| Concern        | Choice |
|----------------|--------|
| Framework      | Next.js 15.3 App Router, React 19, RSC, `next dev --turbopack` |
| Language       | TypeScript (strict), path alias `@/*` → repo root |
| Styling        | Tailwind CSS v4 (`@import 'tailwindcss'`), CSS-variable theme in `app/globals.css` |
| UI kit         | shadcn/ui (`new-york` style, `slate` base, Lucide icons) in `components/ui/` |
| Backend        | Supabase (Auth, Postgres, Storage) via `@supabase/ssr` |
| Client state   | Zustand (persisted to `sessionStorage`) in `service/` |
| Forms          | React Hook Form |
| Tables         | TanStack Table v8 |
| Server state   | TanStack Query v4 (available) |
| Notifications  | Sonner (`toast`) |
| Dates          | `date-fns` |
| Tests          | Jest + Testing Library (`jest-runner-groups`) |

## Commands

```bash
yarn dev      # next dev --turbopack
yarn build    # next build
yarn start    # next start
yarn lint     # next lint
```

There is no `test` script wired in `package.json`; Jest is configured in `jest.config.ts`
(uses `jest-runner-groups`, `jest-fixed-jsdom`). Run via `npx jest` when needed.

## Architecture at a glance

Two role-based areas share the same components and DB layer:

- `app/backend/[userId]/*` — **admin** area (sidebar layout): businesses, users,
  category, prizes, settings.
- `app/users/[userId]/*` — **user** area (top nav layout): their businesses,
  redeem-prizes, settings.

`middleware.ts` → `config/updateSession.ts` refreshes the Supabase session and enforces
role routing (admins → `/backend`, users → `/users`, unauthenticated → `/auth/login`).
`/` redirects to `NEXT_PUBLIC_DESTINATION`.

**Data flow**
- **Reads** in Server Components use the server client `@/config` (`createClient` from
  `config/index.ts`) and `.returns<T>()` for typing.
- **Mutations** run client-side through functions in `supabase/db/*` (using the browser
  client `@/config/client`); they `toast` on error and `throw` on failure.
- **Privileged ops** (e.g. creating auth users) go through route handlers in `app/api/*`
  using the service-role client from `app/api/config/apiConfig.ts`.
- **Dialog/wizard UI state** lives in Zustand stores under `service/`.

## Database (Supabase)

Schema in `supabase/migrations/`. Core tables: `users` (role: admin/developer/user),
`category`, `businesses` (status verified/unverified), `business_personal_details`
(referral link: `referred_by` → users, `business_id`, `category_id`), `user_credits`,
`prizes` (credit_cost, status published/draft, claimed_by). RLS is enabled on all tables;
storage buckets: `business`, `prizes`, `avatars` (5 MB each, public). Credits move via the
`increment_user_credits` / `decrement_user_credits` Postgres RPCs (called on verify/unverify).

Soft-delete is via `archived_at` timestamps (filter `.is('archived_at', null)`), not hard deletes.

## Conventions (quick reference — see skills for detail)

- **Formatting** (`.prettierrc`): no semicolons, single quotes, JSX single quotes,
  2-space tabs, no trailing comma, LF. `prettier/prettier` is an ESLint error.
- Page/layout components are `async function` Server Components returning `Promise<JSX.Element>`;
  interactive components start with `'use client'`.
- Each route segment provides `loading.tsx` (renders `<Spinner />`) and often `error.tsx`.
- DB types live in `lib/types/*` with a `DB` suffix (e.g. `BusinessDB`, `CategoryDB`);
  derive shapes with `Pick`/`Omit` rather than redefining.
- Convert camelCase form payloads with `helpers/camelToSnakeCase` before inserting.
- Use `cn()` from `@/lib/utils` to merge class names. Icons come from `lucide-react`.
- `no-console` is enforced — only `console.error` / `console.info` are allowed.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
NEXT_IMAGE_PUBLIC_URL          # remote image host (next.config.ts remotePatterns)
NEXT_PUBLIC_DESTINATION        # root redirect target
NEXT_PUBLIC_APP_URL
```
