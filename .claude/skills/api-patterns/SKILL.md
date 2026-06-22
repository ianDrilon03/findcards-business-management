---
name: api-patterns
description: FindCards API & data patterns — Supabase clients (browser/server/service-role), the supabase/db mutation layer, RSC data fetching, route handlers + response helpers, middleware auth, Zustand dialog stores, and storage/image handling. Use when reading/writing data, adding API routes, or wiring auth.
---

# API & Data Patterns

Backend is **Supabase** (Auth + Postgres + Storage) via `@supabase/ssr`. There is no
custom REST layer beyond a few Next.js route handlers — most data access goes directly
through typed Supabase queries.

## Three Supabase clients — pick the right one

| Client | File | Import | Key | Use in |
|--------|------|--------|-----|--------|
| Browser | `config/client.ts` | `@/config/client` | anon | `'use client'` components, `supabase/db/*` mutations |
| Server  | `config/index.ts`  | `@/config`        | service-role | Server Components, server-side reads (`getUserDetails`) |
| Service-role (API) | `app/api/config/apiConfig.ts` | relative | service-role | route handlers needing admin/privileged ops |
| Middleware | `config/updateSession.ts` | — | service-role | session refresh + role routing only |

All clients throw if `NEXT_PUBLIC_SUPABASE_URL` / key env vars are missing.

## Reading data (Server Components)

Fetch inline in an `async` page with the server client and type results via `.returns<T>()`.
Filter soft-deletes with `.is('archived_at', null)`; order with `.order(...)`. On error,
`throw error.message` (the segment's `error.tsx` catches it).

```ts
const supabase = await createClient()           // from '@/config'
const { data, error } = await supabase
  .from('business_personal_details')
  .select(`id, referred_by(id, name, email),
           businesses(id, name, status), category(name)`)
  .order('created_at', { ascending: false })
  .is('archived_at', null)
  .returns<Pick<BusinessDetailsDB, 'businesses' | 'category' | 'id' | 'referred_by'>[]>()
if (error) throw error.message
```

## Writing data — the `supabase/db/*` layer

All mutations live in `supabase/db/<entity>.ts`, run client-side with the **browser
client**, and follow this contract:

- `async (...) : Promise<void>`, wrapped in `try/catch` that `throw error` at the end.
- On a Supabase error: `toast.error('ERROR!', { description: 'Something went wrong' })`
  then `throw error.message`.
- On success: `toast('Successfully', { description: '...' })`.
- Wrap calls from components in `useTransition()` (`startTransition`), then `router.refresh()`.

```ts
export const addCategory = async (name: string): Promise<void> => {
  try {
    const supabase = createClient()              // from '@/config/client'
    const { error } = await supabase.from('category').insert({ name })
    if (error) {
      toast.error('Error!', { description: 'Something whent wrong.' })
      throw error.message
    }
    toast('Successfully', { description: 'Successfully created category.' })
  } catch (error) { throw error }
}
```

**Multi-step writes must roll back manually** — there are no DB transactions in this layer.
See `supabase/db/business.ts` `addBusinessInfo`: it uploads an image, inserts the business,
then inserts personal details; if a later step fails it calls `removeImage(...)` and
`fallbackDelete(id, table, supabase)` (`supabase/db/fallbackQuery.ts`) to undo prior steps.

**Credits** are adjusted via Postgres RPCs, not direct updates:
`supabase.rpc('increment_user_credits', { id })` / `'decrement_user_credits'` (called when
verifying / unverifying a business).

## Storage & images (`supabase/db/image.ts`)

Buckets: `business` (default), `prizes`, `avatars` — all public, 5 MB. Helpers:
- `uploadImage(images, supabase, id, bucket?)` → uploads under `${id}/${fileName}`,
  returns `{ imageUrls }` (public URLs).
- `removeImage(images, supabase, id, bucket?)` → cleanup, used in rollback paths.
- `removeImageUponEdit(supabase, path, bucket?)` → delete the old file before re-upload.

Convert camelCase form fields to snake_case with `convertKeysToSnakeCase` from
`@/helpers/camelToSnakeCase` before inserting, since DB columns are snake_case.

## Route handlers (`app/api/*`)

Only for privileged/server-only work. Use the service-role client and the response
helpers in `app/api/helpers/response.ts`. Pattern (`app/api/signUp/route.ts`):

```ts
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createSupabase()       // service-role, app/api/config
    const { error, data } = await supabase.auth.admin.createUser({
      email: body.email, password: body.password, email_confirm: true
    })
    if (error || !data.user) return unauthorizedResponse({ error: error?.message })
    return successResponse({ message: 'Sign up successfully', userId: data.user.id })
  } catch (error) {
    return generalErrorResponse({ error: (error as Error).message })
  }
}
```

Response helpers (all set JSON content-type): `successResponse` (200), `badRequestResponse`
/ `validationErrorNextResponse` (400), `unauthorizedResponse` (401), `forbiddenResponse`
(403), `notFoundResponse` (404), `generalErrorResponse` (500).

## Auth & route protection

- `middleware.ts` delegates to `config/updateSession.ts`: refreshes the session, reads the
  user's `role` from `users`, and redirects — admins are pushed into `/backend/[id]/...`,
  users into `/users/[id]/...`, unauthenticated users hitting a protected route → `/auth/login`.
- Client components read the current user via `useUser()` from `@/context/AuthProvider`
  (`AuthProvider` wraps both area layouts and shows a `<Spinner />` until the role loads).
- Login: `supabase.auth.signInWithPassword(...)` in `app/auth/login/_components/login-form.tsx`,
  then redirect by role. Sign out: `signOut()` in `supabase/db/authClient.ts`.

## Dialog / wizard state (Zustand, `service/`)

UI state for dialogs and multi-step forms lives in Zustand stores persisted to
`sessionStorage`. Stores expose `open` + `toggleOpenDialog(isOpen, payload?)`; some carry a
typed `data`/`type` payload (e.g. `create-categories-dialog.ts`, `alert-dialog.ts`) and the
business wizard (`service/business.ts`) tracks `step` and per-step form data. Read slices
with `useShallow` from `zustand/react/shallow`.

## Types

DB/domain types live in `lib/types/*` with a `DB` suffix (`BusinessDB`, `CategoryDB`,
`PrizesDB`, `UserCredits`). Derive request/response shapes with `Pick`/`Omit` rather than
re-declaring (e.g. `PrizesForm = Pick<PrizesDB, 'name' | 'status' | 'credit_cost' | 'image'>`).
