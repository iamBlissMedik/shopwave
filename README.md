# 🛍️ Shopwave — Multi-Vendor Marketplace

A full-stack, role-based marketplace built as a Turborepo monorepo: three
role-scoped **Next.js 14** apps, an **Express + Prisma + PostgreSQL** API, and a
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
| Frontend | Next.js 14 (App Router) × 3 apps |
| Styling | Tailwind CSS + CSS-variable design tokens (light/dark) |
| Server state | TanStack Query · Forms: React Hook Form + Zod · Motion: Framer Motion |
| HTTP | Axios (httpOnly cookie auth) · Charts: Recharts |
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
    ├── api-client/           # one axios client + typed endpoint modules
    ├── hooks/                # React Query hooks, Auth/Theme providers, RoleGuard
    ├── ui/                   # presentational components (+ stories + tests)
    └── config/              # Tailwind preset, base tsconfig, design-token CSS
```

- **Backend = feature modules.** Each feature owns `routes → controller →
  service → schema`; business logic lives in services.
- **Frontend = three apps, one set of packages.** Everything shared lives in
  `packages/*`. Dependency direction: `apps → hooks → api-client → types`, `apps → ui → types`.

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
> session is shared across subdomains.

### Scripts
```bash
pnpm dev | build | lint | typecheck | test     # turbo across workspaces
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

**104 automated tests** across 4 workspaces (`pnpm test`):

- **API integration** (`apps/api`, 41) — Vitest + Supertest against an isolated
  Postgres test DB (`createdb shopwave_test`): auth, catalogue, the checkout
  transaction, access control, marketplace integrity, guest-cart merge, dashboards,
  plus an OpenAPI docs-coverage test.
- **Component** (`packages/ui`, 52), **hooks** (7), **api-client** (4).

Every `packages/ui` component ships **JSDoc + a story + a test**; every API route
is in the OpenAPI table (both enforced — see [CONTRIBUTING.md](./CONTRIBUTING.md)).
Acceptance criteria for every flow live in [docs/TEST-PLAN.md](./docs/TEST-PLAN.md).

---

### License
MIT — built as a learning / portfolio project.
