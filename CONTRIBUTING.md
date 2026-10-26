# Contributing

A few conventions keep this monorepo maintainable as it grows.

## Where code goes

| You're adding… | Put it in… |
| --- | --- |
| A reusable, presentational component | `packages/ui` (+ story + test) |
| A shared provider / auth or theme hook | `packages/hooks` |
| An app's domain data hook | that app's `src/hooks` (e.g. `apps/user/src/hooks`) |
| A query (key + fetcher) or URL filter parser | that app's `src/queries.ts` |
| A page's interactive UI | that app's `src/components/*View.tsx` (client) |
| A shared API endpoint (e.g. `auth`) | `packages/api-client` (`src/endpoints/*`) |
| An app's domain API endpoint | that app's `src/api` (e.g. `apps/merchant/src/api`) |
| A shared domain type or form schema | `packages/types` |
| A design token / Tailwind/tsconfig change | `packages/config` |
| A customer page | `apps/user/src/app/…` |
| A merchant page | `apps/merchant/src/app/(dashboard)/…` |
| An admin page | `apps/admin/src/app/(dashboard)/…` |
| A backend endpoint | `apps/api/src/modules/<feature>` (route → controller → service → schema) |

The three apps deploy to separate subdomains (`user` :3000, `merchant` :3001, `admin` :3002) and share everything else through `packages/*`. Dependency direction: `apps → hooks → (ui, api-client) → types`; `apps → ui → types`. Never import an app from a package.

## Adding a page

Pages are server-rendered; interactivity lives in a client view. Follow the existing pages:

1. **`src/queries.ts`** — add a `queryOptions` factory taking the app's `Api` (and, for a list, a `parseXFilters(URLSearchParams)` parser).
2. **`src/hooks/useX.ts`** — `useQuery({ ...xQuery(api, …) })` for the client.
3. **`src/components/XView.tsx`** (`'use client'`) — the UI; read list state with `useUrlFilters(parseXFilters)`.
4. **`src/app/…/page.tsx`** (Server Component) — `export const metadata`, then prefetch with the same factory and render the view:

```tsx
export default async function XPage({ searchParams }: PageProps<'/x'>) {
  const filters = parseXFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(xQuery(await getServerApi(), filters));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <XView />
    </HydrationBoundary>
  );
}
```

Because both sides build the query from the same parser and factory, the keys match and the client starts with the server's data (no refetch, no spinner). Don't wrap error-prone server reads in a bare `try/catch` — let Next's own `notFound()` / `redirect()` / dynamic-rendering signals propagate (see `getServerSession`).

## The component rule (`packages/ui`)

Every exported component must ship with:

1. **JSDoc** describing what it is / when to use it.
2. **A Storybook story** (`*.stories.tsx`) — default + key states.
3. **A test** (`__tests__/*.test.tsx`) covering its behaviour.

Keep `packages/ui` framework-light: no `next/*` and no data hooks. If a component needs the router or `Image`, accept them as props (see `DashboardShell`/`ProductCard`) — and pass a **stable** component (Next's `Link` itself, or an adapter defined at module scope), never an inline arrow, or it remounts on every render.

## Design conventions

Use what `@shopwave/ui` already provides instead of re-styling by hand, so all three apps look like one product:

| Need | Use |
| --- | --- |
| Colours | Semantic tokens only (`bg-surface`, `text-muted`, `border-border`, `text-brand`…) — never raw `gray-*` |
| A button | `Button` (`variant` / `size` / `isLoading`) |
| A link that looks like a button | `<Link className={buttonClasses()}>` — never a `<button>` inside an `<a>` |
| Text / select inputs | `Input`, `Select` (or `fieldClasses` for a one-off control) |
| Loading / empty / error screens | `LoadingState`, `EmptyState`, `ErrorState` |
| Panels | `Card` |

Corner radii: containers (`Card`, panels) `rounded-2xl`, controls (buttons, inputs, nav items, thumbnails) `rounded-lg`, pills (`Badge`) `rounded-full`. Icon-only controls need an `aria-label`; decorative icons get `aria-hidden`.

## The new-service rule (enforced by a test) ✅

**Any new API route MUST be documented.** When you add a route under `apps/api`:

1. Add the `router.<method>(...)` in the module's `*.routes.ts`.
2. Add/extend its **Zod schema** and wire it through the `validate` middleware.
3. Authorize it with `authenticate` + `authorize(role)`; scope ownership in the **service**.
4. **Add an entry to the `ROUTES` table in [`apps/api/src/docs/openapi.ts`](./apps/api/src/docs/openapi.ts)** (method, path, tag, summary, `secure`, request body/query).
5. Add an integration test in `apps/api/src/test/`.

Step 4 is not optional: `src/docs/__tests__/openapi.coverage.test.ts` walks the live Express router and **fails CI if any mounted `/api` route is missing from the OpenAPI spec** (or vice-versa). So an undocumented service breaks the build. Browse the live docs at `http://localhost:4000/docs`.

## Backend conventions

- Keep business logic in **services**, not controllers.
- Validate **every** request with a Zod schema via the `validate` middleware.
- Authorize with `authenticate` + `authorize(role)`; the API is the real security boundary.
- Money is stored and transferred as integer **cents**.

## Before opening a PR

```bash
pnpm lint        # ESLint (each app, flat config)
pnpm typecheck   # all workspaces
pnpm test        # API integration + UI unit tests
pnpm build       # everything compiles
pnpm format      # prettier
```

The API tests need a Postgres test database — see [`apps/api/README.md`](./apps/api/README.md).
