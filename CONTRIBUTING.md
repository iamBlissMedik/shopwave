# Contributing

A few conventions keep this monorepo maintainable as it grows.

## Where code goes

| You're adding… | Put it in… |
| --- | --- |
| A reusable, presentational component | `packages/ui` (+ story + test) |
| A shared React Query hook / provider | `packages/hooks` |
| A typed API endpoint method | `packages/api-client` (`src/endpoints/*`) |
| A shared domain type or form schema | `packages/types` |
| A design token / Tailwind/tsconfig change | `packages/config` |
| A customer page | `apps/user/src/app/…` |
| A merchant page | `apps/merchant/src/app/(dashboard)/…` |
| An admin page | `apps/admin/src/app/(dashboard)/…` |
| A backend endpoint | `apps/api/src/modules/<feature>` (route → controller → service → schema) |

The three apps deploy to separate subdomains (`user` :3000, `merchant` :3001, `admin` :3002) and share everything else through `packages/*`. Dependency direction: `apps → hooks → api-client → types`; `apps → ui → types`. Never import an app from a package.

## The component rule (`packages/ui`)

Every exported component must ship with:

1. **JSDoc** describing what it is / when to use it.
2. **A Storybook story** (`*.stories.tsx`) — default + key states.
3. **A test** (`__tests__/*.test.tsx`) covering its behaviour.

Keep `packages/ui` framework-light: no `next/*` and no data hooks. If a component needs the router or `Image`, accept them as props (see `DashboardShell`/`ProductCard`).

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
pnpm typecheck   # all workspaces
pnpm test        # API integration + UI unit tests
pnpm build       # everything compiles
```

The API tests need a Postgres test database — see [`apps/api/README.md`](./apps/api/README.md).
