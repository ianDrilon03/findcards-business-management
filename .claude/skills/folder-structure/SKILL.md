---
name: folder-structure
description: FindCards folder structure and routing — where pages, components, services, DB access, config, types and helpers live, plus the admin/user role areas. Use when adding files, creating routes, or deciding where code belongs.
---

# Folder Structure

Path alias: `@/*` maps to the repo root (`tsconfig.json`). Import as `@/components/...`,
`@/supabase/db/...`, `@/config`, `@/lib/types/...`, `@/service/...`, `@/helpers/...`.

## Top-level layout

```
app/                 Next.js App Router (routes, layouts, route handlers)
components/
  ui/                shadcn/ui primitives (+ customized Input)
  custom/            project wrappers: Container, CustomButton, Spinner, DialogAlert,
                     ImageUpload, Navigation, PreviousButton
  app/components/    shared feature components (BusinessCard, BusinessView)
config/              Supabase clients + session middleware helper
  client.ts          browser client (anon key)  → @/config/client
  index.ts           server client (RSC/cookies) → @/config
  updateSession.ts   middleware session refresh + role routing
context/             React context providers (AuthProvider.tsx → useUser)
service/             Zustand stores (dialog/wizard UI state, persisted to sessionStorage)
supabase/
  db/                data-access mutation layer (business, auth, category, prizes,
                     image, authClient, fallbackQuery)
  migrations/        SQL schema
  config.toml        Supabase CLI config
lib/
  types/             DB/domain types (business, category, prizes, user) — `DB` suffix
  hook/              data hooks (useCategory.ts)
  utils.ts           cn() helper
hooks/               UI hooks (use-mobile.ts)
helpers/             pure utilities (constants, camelToSnakeCase, avatarName, regex, copyString)
public/              static assets (images/)
```

## Routing & role areas

Two role-gated areas, gated by `middleware.ts` → `config/updateSession.ts`:

```
app/
  page.tsx                      → redirects to NEXT_PUBLIC_DESTINATION
  layout.tsx                    root layout (fonts, <Toaster/>)
  auth/login/                   login (page + _components/login-form.tsx)
  api/                          route handlers (see api-patterns skill)

  backend/                      ADMIN area — sidebar layout (AppSidebar + AuthProvider)
    layout.tsx
    components/Breadcrumbs.tsx
    [userId]/
      businesses/               (+ [businessId] detail)
      users/  category/  prizes/  settings/

  users/                        USER area — top-nav layout (Navigation + AuthProvider)
    [userId]/
      layout.tsx
      businesses/               (+ [businessId] detail)
      redeem-prizes/  settings/
```

### Route segment conventions
Each meaningful segment ships:
- `page.tsx` — **async Server Component**, returns `Promise<JSX.Element>`, fetches data
  with the server client `@/config` and wraps content in `<Container>`.
- `loading.tsx` — renders the centered `<Spinner />`.
- `error.tsx` — `'use client'` error boundary with a "Go Back" button (admin businesses
  has a fuller version with an illustration).
- `components/` (or `_components/`) — route-local components, typically `'use client'`
  tables, dialogs and forms.

## Where to put new code

| Adding…                              | Put it in… |
|--------------------------------------|------------|
| A new page/route                     | `app/<area>/[userId]/<feature>/page.tsx` (+ loading/error) |
| A route-local table/dialog/form      | `app/.../<feature>/components/` |
| A reusable styled wrapper            | `components/custom/` |
| A shadcn primitive                   | `components/ui/` (via `npx shadcn add`) |
| A DB read for an RSC                 | inline in the `page.tsx` using `@/config` |
| A DB write/mutation                  | `supabase/db/<entity>.ts` (browser client, toast + throw) |
| A privileged/server-only operation   | a route handler in `app/api/<name>/route.ts` |
| Dialog/wizard UI state               | a Zustand store in `service/` |
| A shared type                        | `lib/types/<entity>.ts` (suffix `DB`, derive with Pick/Omit) |
| A pure helper                        | `helpers/` |

Keep imports using the `@/` alias and follow the no-semicolon / single-quote Prettier style.
