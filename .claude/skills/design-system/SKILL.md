---
name: design-system
description: FindCards design system — Tailwind v4 + shadcn/ui (new-york) tokens, OKLCH theming, and the custom Input/CustomButton/Container/Spinner wrappers. Use when building or styling UI, adding shadcn components, or theming.
---

# Design System

Tailwind CSS **v4** + **shadcn/ui** (`new-york` style, `slate` base color, Lucide icons,
RSC + TSX). Config is in `components.json`. Theme tokens live in `app/globals.css`.

## Theming (OKLCH CSS variables)

`app/globals.css` imports Tailwind (`@import 'tailwindcss'`), declares the dark variant
(`@custom-variant dark (&:is(.dark *))`), and maps semantic tokens in `@theme inline`.
Colors are defined as **OKLCH** CSS variables on `:root` and `.dark`.

Use semantic utility classes, never raw hex — they resolve to the tokens:

- Surfaces: `bg-background` / `text-foreground`, `bg-card`, `bg-popover`, `bg-muted`,
  `bg-accent`, `bg-secondary`.
- Brand/intent: `bg-primary` / `text-primary-foreground`, `bg-destructive`,
  `text-muted-foreground`.
- Sidebar: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, etc.
- Charts: `--chart-1..5` (used with Recharts).
- Radius: `--radius: 0.625rem` with `--radius-sm/md/lg/xl` derivations.

To add a new color, add the variable to **both** `:root` and `.dark`, then expose it under
`@theme inline` as `--color-<name>: var(--<name>)`.

Fonts: Geist Sans / Geist Mono loaded in `app/layout.tsx` as `--font-geist-sans` /
`--font-geist-mono`. Scrollbars: add the `custom-scrollbar` class (defined in globals.css).

## Adding shadcn/ui components

Components live in `components/ui/`. Add new ones with the shadcn CLI (it respects
`components.json` aliases):

```bash
npx shadcn@latest add <component>
```

Aliases: `@/components`, `@/components/ui`, `@/lib/utils` (`cn`), `@/lib`, `@/hooks`.
Always merge classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge).

## Custom wrappers — prefer these over raw primitives

Located in `components/custom/`:

### `Input` (`components/ui/input.tsx`)
The shadcn input is **customized**: it renders a `<Label>` from a `title` prop and shows
validation errors via `hasError` + `errorMessage`. Wire it to React Hook Form:

```tsx
<Input
  title='Category'
  {...register('name', { required: 'Field is required.' })}
  hasError={!!errors.name}
  errorMessage={errors.name?.message}
/>
```

### `CustomButton` (`components/custom/CustomButton.tsx`)
Wraps the shadcn `Button`, adds `cursor-pointer` and an `isLoading` spinner
(`Loader2Icon` animate-spin). Use it for any submit/action button with async work:

```tsx
<CustomButton onClick={handleSubmit(onSubmit)} disabled={isPending} isLoading={isPending}>
  Create
</CustomButton>
```

### `Container` (`components/custom/Container.tsx`)
Standard page shell: `title` (`text-4xl font-bold`) + `description` (`text-sm text-gray-400`),
auto-shows a `PreviousButton` on detail pages. Wrap page content in it:

```tsx
<Container title='Manage Businesses' description='You can manage businesses here'>
  {/* content */}
</Container>
```

### `Spinner` (`components/custom/Spinner.tsx`)
Inline SVG loader. The standard full-page loading state is:
`<div className='flex items-center justify-center h-[85vh]'><Spinner /></div>` — this is
what `loading.tsx` files render.

Other custom components: `DialogAlert`, `ImageUpload`, `Navigation`, `PreviousButton`.

## Patterns & idioms

- Notifications: **Sonner** `toast(...)` / `toast.error('ERROR!', { description })`.
  `<Toaster />` is mounted once in `app/layout.tsx`.
- Icons: `lucide-react` only.
- Responsive grids: `grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2`.
- Dates: `date-fns` `format(value, "MMMM dd, yyyy hh:mm aaaaa'm'")`.
- Tables: TanStack Table v8 with shadcn `Table` primitives + a dropdown actions column
  (see `app/backend/[userId]/category/components/CategoryTable.tsx`).
- Formatting is enforced: **no semicolons, single quotes, JSX single quotes**, 2-space indent.
