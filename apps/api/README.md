# @shopwave/api

Express + Prisma + PostgreSQL backend. See the [root README](../../README.md) for the
full architecture, data model, security notes, and API reference.

## Layered structure
```
route → controller → service → prisma
        (HTTP)       (logic+DB)
```
Each feature lives in `src/modules/<feature>/` as `routes / controller / service / schema`.
Feature modules: `auth`, `product`, `cart`, `order`, `merchant` (seller dashboard),
`admin` (platform console). Role access = `authorize(role)` middleware **+**
ownership checks in services (a merchant only touches their own products; admin bypasses).

## Scripts
```bash
pnpm dev          # tsx watch (hot reload)
pnpm build        # tsc → dist/
pnpm start        # run compiled dist/index.js
pnpm typecheck    # tsc --noEmit
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # seed demo data
pnpm db:studio    # Prisma Studio GUI
pnpm db:reset     # drop + recreate + seed
```

## Key files
| File | Role |
| --- | --- |
| `src/app.ts` | Express app + middleware chain (helmet, cors, rate-limit, logging). |
| `src/index.ts` | Server bootstrap + graceful shutdown. |
| `src/config/env.ts` | Zod-validated environment variables (fails fast). |
| `src/middleware/auth.ts` | JWT cookie/bearer authentication + role authorization. |
| `src/middleware/validate.ts` | Generic Zod request validator. |
| `src/middleware/error.ts` | Central error handler → consistent JSON envelope. |
| `src/modules/*` | Feature slices: auth, product, cart, order. |
