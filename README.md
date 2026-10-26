# 🛍️ Shopwave — Multi-Vendor Marketplace

A full-stack, role-based marketplace built as a Turborepo monorepo: three
role-scoped **Next.js 16** (React 19) apps, an **Express + Prisma + PostgreSQL** API, and a
set of shared packages (UI, hooks, API client, types, design tokens).

- 🛒 **Customer** — browse every store, cart & checkout, view orders
- 🏪 **Merchant** — manage own products, see sales + revenue charts
- 🛡️ **Admin** — manage users & roles, moderate the catalogue, platform stats

> Small in features but production-shaped in structure. No payments SDK, no
> microservices — just the core marketplace flow done with the right patterns.

📄 **[docs/TEST-PLAN.md](./docs/TEST-PLAN.md)** — test cases & acceptance criteria

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router, Turbopack) + React 19 × 3 apps — server-rendered |
| Styling | Tailwind CSS + CSS-variable design tokens (light/dark) |
| Server state | TanStack Query (SSR-prefetched + hydrated) · Forms: React Hook Form + Zod |
| Motion | CSS keyframes (SSR-safe, reduced-motion aware) · Framer Motion only for the cart's exit/layout animation |
| HTTP | One `fetch` transport for browser + server (httpOnly cookie auth) · Charts: Recharts (lazy-loaded) |
| Backend | Express, built with tsup (esbuild) |
| ORM / DB | Prisma / PostgreSQL |
| Auth | JWT in httpOnly cookie + bcrypt, role-based |
| Tooling | Vitest + Testing Library, Storybook, Pino logging, OpenAPI/Swagger |

---

## Monorepo layout

```text
shopwave/
├── apps/
│   ├── api/                  # Express + Prisma backend
│   │   ├── prisma/           # schema.prisma + migrations + seed
│   │   └── src/
│   │       ├── config/ lib/ middleware/ utils/
│   │       ├── modules/      # feature slices: routes → controller → service → schema
│   │       │   └── auth/ product/ cart/ order/ merchant/ admin/
│   │       └── docs/openapi.ts   # route table → Swagger UI at /docs
│   ├── user/                 # storefront        (→ user.app.com   :3000)
│   ├── merchant/             # merchant dashboard (→ merchant.app.com :3001)
│   └── admin/                # admin console      (→ admin.app.com  :3002)
└── packages/
    ├── types/                # DTOs + shared Zod schemas (no React)
    ├── api-client/           # fetch transport (browser + server) + shared auth (apps own their domain endpoints)
    ├── hooks/                # providers, LoginForm, server session/SSR helpers, URL state, query keys
    ├── ui/                   # presentational components (+ stories + tests)
    └── config/              # Tailwind preset, base tsconfig, design-token CSS
```

- **Backend = feature modules.** Each feature owns `routes → controller →
  service → schema`; business logic lives in services.
- **Frontend = three apps + shared packages.** Cross-cutting code (transport,
  auth/theme, UI, types) lives in `packages/*`; **each app owns its own domain
  endpoints and data hooks** under `src/api` and `src/hooks`, so the storefront
  never ships merchant/admin code and vice-versa. Dependency direction:
  `apps → hooks → (ui, api-client) → types`, `apps → ui → types`.

---

## Rendering, data & motion

- **Server-rendered first paint.** Every `page.tsx` is a Server Component. It
  prefetches its data with the visitor's cookies (`@shopwave/hooks/server`) into
  a per-request React Query client and hands it to the page's client view via
  `HydrationBoundary` — so the HTML arrives complete (no loading spinners, fully
  crawlable) and the browser continues with the same cache, mutations and
  invalidation. Each app's `src/queries.ts` holds the URL parsers and
  `queryOptions` both sides share, which is what makes the query keys match.
- **URL-driven lists.** Filters and pagination live in the URL (`?category=…&page=2`):
  shareable, server-rendered, and restored by Back. Changes go through
  `history.pushState`/`replaceState` (`useUrlFilters`), so they don't round-trip
  the server.
- **Auth on the server.** The root layout resolves the session once per request
  (so the navbar is right in the first HTML), dashboards verify the role in their
  layout before rendering anything, and `proxy.ts` gives cookie-less visitors a
  fast redirect that keeps the deep link. The API still authorizes every request.
- **SEO.** Per-page titles, product `generateMetadata` (description, canonical,
  Open Graph image), real `404`s, `sitemap.xml` and `robots.txt` on the
  storefront; dashboards are `noindex`.
- **Motion.** Page, list, badge and icon entrances are CSS keyframes animating only
  `opacity`/`transform` (compositor-friendly), so they play on the server-rendered
  HTML without waiting for JavaScript and are switched off by the OS
  "reduce motion" setting. Loading states fade in only after ~150 ms, so fast
  loads never flash a spinner. Charts load lazily behind same-size skeletons.

---

## Getting started

### Prerequisites
**Node 22+** (see `.nvmrc`), **pnpm 11+** (`npm i -g pnpm`), **PostgreSQL** running locally.

### Setup
```bash
pnpm install

cp apps/api/.env.example apps/api/.env              # set DATABASE_URL + JWT_SECRET
cp apps/user/.env.example apps/user/.env.local      # NEXT_PUBLIC_API_URL
cp apps/merchant/.env.example apps/merchant/.env.local
cp apps/admin/.env.example apps/admin/.env.local

createdb shopwave
pnpm db:migrate         # create tables
pnpm db:seed            # 3 roles + 2 stores + products

pnpm dev                # api :4000 + user :3000 + merchant :3001 + admin :3002
```

| Service | URL |
| --- | --- |
| Customer storefront | http://localhost:3000 |
| Merchant dashboard | http://localhost:3001 |
| Admin console | http://localhost:3002 |
| API · health | http://localhost:4000 · `/health` |
| **API docs (Swagger UI)** | **http://localhost:4000/docs** · spec `/openapi.json` |
| Prisma Studio | `pnpm db:studio` |
| Storybook | `pnpm storybook` → http://localhost:6006 |

### Demo accounts (from the seed)
| Role | Email | Password |
| --- | --- | --- |
| Customer | `user@example.com` | `User1234!` |
| Merchant (SoundHub) | `sound@example.com` | `Merchant1!` |
| Merchant (GearStop) | `gear@example.com` | `Merchant1!` |
| Admin | `admin@example.com` | `Admin123!` |

> **Production subdomains:** each app deploys independently to
> `user|merchant|admin.app.com`, all pointing at one API (`api.app.com`). Set the
> API's `CORS_ORIGINS` to those origins and `COOKIE_DOMAIN=.app.com` so the
> session is shared across subdomains (the apps' servers read it to render
> signed-in pages). Set each app's `API_URL` to the API's internal address so
> server rendering skips the public load balancer, and the storefront's
> `SITE_URL` to its public origin (canonical URLs, Open Graph, sitemap).

### Scripts
```bash
pnpm dev | build | lint | typecheck | test     # turbo across workspaces (lint = ESLint per app)
pnpm format                                   # prettier
pnpm db:migrate | db:seed | db:studio
pnpm storybook
```

---

## Data model

```text
User(role) 1──1 Cart 1──* CartItem *──1 Product *──1 User(merchant)
   │                                        │
   └──1──* Order 1──* OrderItem *───────────┘
```

| Model | Notes |
| --- | --- |
| **User** | `role` (USER/MERCHANT/ADMIN), `storeName?` (merchants), owns `products`. |
| **Product** | `price` **(Int cents)**, `stock`, `isActive` (soft delete), `merchantId` (owner). Indexed for list filters. |
| **Cart / CartItem** | One cart per owner — a user **or** an anonymous guest (`userId?` / `sessionId?`). `(cartId, productId)` unique; adds use an atomic `increment`. |
| **Order / OrderItem** | Created atomically at checkout; OrderItem **snapshots price** so history is immutable. FK-indexed `orderId`/`productId`. |

Money is integer **cents** everywhere; formatting happens once at the UI edge.

---

## API

Base `http://localhost:4000/api`. Errors: `{ "error": { "message", "details?" } }`.
**Interactive docs at `/docs`** (a test fails the build if any route is undocumented).

- **Auth** — `POST /auth/register|login|logout` · `GET /auth/me`
- **Catalogue (public)** — `GET /products` (filters + pagination) · `/products/categories` · `/products/:id`
- **Cart (guest or customer)** — `GET /cart` · `POST/PATCH/DELETE /cart/items…` · `DELETE /cart`
- **Orders** — `POST /orders/checkout` (transactional) · `GET /orders` · `/orders/:id`
- **Merchant** (MERCHANT) — `/merchant/stats` · `/merchant/sales` · `/merchant/products` CRUD
- **Admin** (ADMIN) — `/admin/stats` · `/admin/users` (+role/delete) · `/admin/products` (moderate)

List endpoints return `{ data, meta }` with consistent pagination metadata.

---

## Testing, docs & Storybook

**135 automated tests** across 5 workspaces (`pnpm test`):

- **API integration** (`apps/api`, 41) — Vitest + Supertest against an isolated
  Postgres test DB (`createdb shopwave_test`): auth, catalogue, the checkout
  transaction, access control, marketplace integrity, guest-cart merge, dashboards,
  plus an OpenAPI docs-coverage test.
- **Component** (`packages/ui`, 63), **hooks** (19 — query keys, URL state, redirect safety…),
  **api-client** (8 — the fetch transport), **user app** (4 — URL parsing, data hook).

Every `packages/ui` component ships **JSDoc + a story + a test**; every API route
is in the OpenAPI table (both enforced — see [CONTRIBUTING.md](./CONTRIBUTING.md)).
Acceptance criteria for every flow live in [docs/TEST-PLAN.md](./docs/TEST-PLAN.md).

---

### License
MIT — built as a learning / portfolio project.
