# Shopwave — Test Cases & Acceptance Criteria

End-to-end QA reference for the marketplace: the Express API and the three
role-scoped frontends (`user`, `merchant`, `admin`). Each case lists
**preconditions → steps → acceptance criteria (Given/When/Then)** and how it is
**covered** (automated test file, or the manual live run on 2026-06-17).

- ✅ = verified (automated and/or live). All cases below are currently passing.
- **Automated suites:** `apps/api` (41, Vitest + Supertest), `packages/ui` (63, Vitest + Testing Library), `packages/hooks` (19, query keys / URL state / notify / redirect sanitizing), `packages/api-client` (8, fetch transport + error normalization), `apps/user` (4, URL filter parsing + catalogue data-hook). **135 total** across 5 workspaces. Browser-level flows below marked *live* were exercised in headless Chrome against production builds.
- **Live smoke run:** API on `:4000` against the seeded `shopwave` DB; apps on `:3000/:3002/:3005`.

## How to run

```bash
# Unit/integration suites (Postgres must be running; creates shopwave_test)
createdb shopwave_test 2>/dev/null || true
pnpm test                      # all workspaces (46 cases)

# Manual / exploratory
pnpm db:migrate && pnpm db:seed
pnpm dev                       # api :4000, user :3000, merchant :3001, admin :3002
open http://localhost:4000/docs    # Swagger UI — "try it out" every endpoint
```

## Test environment & accounts (from the seed)

| Role | Email | Password |
| --- | --- | --- |
| Customer | `user@example.com` | `User1234!` |
| Merchant (SoundHub) | `sound@example.com` | `Merchant1!` |
| Merchant (GearStop) | `gear@example.com` | `Merchant1!` |
| Admin | `admin@example.com` | `Admin123!` |

Money is integer **cents** everywhere (`12999` = `$129.99`).

---

## 1. Authentication

### TC-AUTH-01 — Register a customer ✅
- **Pre:** email not in use.
- **Steps:** `POST /api/auth/register` `{name,email,password,role:USER}`.
- **Acceptance:** *Given* a unique email, *when* registering as USER, *then* respond `201` with `{user}` (role `USER`, **no password field**) and set an httpOnly `token` cookie.
- **Covered:** `auth.test.ts` · live.

### TC-AUTH-02 — Register a merchant requires a store name ✅
- **Acceptance:** *Given* role `MERCHANT` **without** `storeName`, *when* registering, *then* `400`. *Given* a `storeName`, *then* `201` with `storeName` echoed.
- **Covered:** `auth.test.ts`.

### TC-AUTH-03 — Login & identity ✅
- **Acceptance:** *Given* valid credentials, *when* `POST /api/auth/login`, *then* `200` + cookie; *and* `GET /api/auth/me` returns the same user.
- **Covered:** `auth.test.ts` · live.

### TC-AUTH-04 — No user enumeration ✅
- **Acceptance:** *Given* a wrong password vs an unknown email, *when* logging in, *then* **both** return `401` with the **identical** message ("Invalid email or password").
- **Covered:** `auth.test.ts`.

### TC-AUTH-05 — Logout clears the session ✅
- **Acceptance:** *When* `POST /api/auth/logout`, *then* `200` and the `token` cookie is cleared; subsequent `GET /api/auth/me` → `401`.
- **Covered:** `auth.test.ts` · live.

### TC-AUTH-06 — Password validation ✅
- **Acceptance:** *Given* a password < 8 chars, *then* register `400` (validation failed).
- **Covered:** form Zod (`@shopwave/types`) + server `validate`.

---

## 2. Catalogue (public)

### TC-CAT-01 — List with pagination metadata ✅
- **Acceptance:** *When* `GET /api/products?limit=2`, *then* `200`, `data.length == 2`, and `meta` has `total/page/limit/totalPages/hasNextPage/hasPrevPage`.
- **Covered:** `products.test.ts` · live.

### TC-CAT-02 — Filter by category ✅
- **Acceptance:** *Given* `?category=Audio`, *then* every returned product has `category == "Audio"`.
- **Covered:** `products.test.ts` · live.

### TC-CAT-03 — Sort by price ascending ✅
- **Acceptance:** *Given* `?sort=price_asc`, *then* prices are non-decreasing.
- **Covered:** `products.test.ts`.

### TC-CAT-04 — Get one / 404 ✅
- **Acceptance:** *Given* a valid id → `200` with `{product}`; *given* an unknown id → `404`.
- **Covered:** `products.test.ts` · live.

### TC-CAT-05 — Categories list ✅
- **Acceptance:** *When* `GET /api/products/categories`, *then* `200` with `{categories: string[]}`.
- **Covered:** live.

---

## 3. Cart (customer)

### TC-CART-01 — Add item returns fresh cart ✅
- **Pre:** logged-in USER; a product with stock.
- **Acceptance:** *When* `POST /api/cart/items {productId, quantity:2}`, *then* `200` with `cart.itemCount == 2` and correct `subtotal`.
- **Covered:** `cart-checkout.test.ts` · live.

### TC-CART-02 — Update quantity ✅
- **Acceptance:** *When* `PATCH /api/cart/items/:productId {quantity:3}`, *then* `cart.itemCount == 3`.
- **Covered:** `cart-checkout.test.ts` · live.

### TC-CART-03 — Remove item ✅
- **Acceptance:** *When* `DELETE /api/cart/items/:productId`, *then* `cart.itemCount == 0`.
- **Covered:** `cart-checkout.test.ts`.

### TC-CART-04 — Quantity bounds ✅
- **Acceptance:** *Given* `quantity < 1` or `> 99`, *then* `400`.
- **Covered:** cart Zod schema.

### TC-CART-05 — Cart UX: badge & exit animation ✅
- **Acceptance:** *When* an item is added, *then* the navbar cart badge springs/pops to the new count; *when* an item is removed on `/cart`, *then* the row animates out and the rest slide up; reduced-motion users get no animation.
- **Covered:** live (badge = CSS `animate-pop-in`; cart rows = Framer Motion `AnimatePresence` + `layout` under `MotionConfig reducedMotion="user"`).

### TC-CART-06 — Guest cart + merge-on-login ✅
- **Acceptance:** *Given* an anonymous visitor, *when* they `POST /api/cart/items`, *then* `200` and a server cart is created keyed by an httpOnly `cart_sid` cookie (cross-request, isolated per session). *When* they then log in / register, *then* the guest cart is **merged into their account cart** (quantities summed, clamped to stock) and the `cart_sid` cookie is cleared. Cart follows the account cross-device thereafter.
- **Covered:** `cart-guest.test.ts` (4 cases) · live.

### TC-CART-07 — Repeated adds accumulate atomically ✅
- **Acceptance:** *When* the same product is added twice, *then* it stays one line item with summed quantity (DB-level `increment` — no lost update / duplicate line).
- **Covered:** `cart-checkout.test.ts`.

---

## 4. Checkout & orders (the money path)

### TC-CHK-01 — Atomic checkout creates a PAID order & decrements stock ✅
- **Pre:** USER with N items in cart; product stock S.
- **Acceptance:** *When* `POST /api/orders/checkout`, *then* `201` with `order.status == "PAID"` and correct `total`; product stock becomes `S − qty`; cart is emptied; order appears in `GET /api/orders`.
- **Covered:** `cart-checkout.test.ts` · live.

### TC-CHK-02 — Oversell is rejected, stock untouched ✅
- **Pre:** cart qty 3; merchant lowers stock to 2.
- **Acceptance:** *When* checkout, *then* `400`; **no** order created; stock stays `2` (transaction rolled back). Decrement is a guarded `UPDATE … WHERE stock >= qty` → 0 rows affected rolls back (race-proof).
- **Covered:** `cart-checkout.test.ts`.

### TC-CHK-03 — Empty-cart checkout rejected ✅
- **Acceptance:** *Given* an empty cart, *when* checkout, *then* `400`.
- **Covered:** `cart-checkout.test.ts`.

### TC-CHK-04 — Order history is owner-scoped ✅
- **Acceptance:** *When* a USER requests an order id that isn't theirs, *then* `404` (never another user's data).
- **Covered:** `access-control.test.ts` · live.

### TC-CHK-05 — Price snapshot immutability ✅
- **Acceptance:** *Given* an order line, *when* the product's price later changes, *then* the order's `OrderItem.price` and `total` are unchanged (historical order preserved).
- **Covered:** `marketplace-integrity.test.ts`.

### TC-CHK-06 — Idempotent checkout ✅
- **Acceptance:** *Given* a checkout with an `Idempotency-Key` header, *when* it's replayed with the same key, *then* the **same order** is returned (not a duplicate), stock is decremented **once**, and exactly one order exists. A concurrent same-key collision is settled by the unique constraint.
- **Covered:** `cart-checkout.test.ts`.

---

## 5. Merchant dashboard (role MERCHANT)

### TC-MER-01 — Dashboard stats ✅
- **Acceptance:** logged-in MERCHANT → `GET /api/merchant/stats` `200` (revenue, units, active products, low-stock, charts data).
- **Covered:** `access-control.test.ts` · live.

### TC-MER-02 — Create product ✅
- **Acceptance:** *When* `POST /api/merchant/products` with a valid body, *then* `201`/`200` with `{product}`; it appears in the public catalogue.
- **Covered:** live.

### TC-MER-03 — Update / price edit ✅
- **Acceptance:** *When* `PATCH /api/merchant/products/:id {price}`, *then* `200` with updated price.
- **Covered:** live.

### TC-MER-04 — Delete / hide product ✅
- **Acceptance:** *When* `DELETE /api/merchant/products/:id`, *then* `200`; toggling `isActive:false` hides it from the storefront without destroying order history.
- **Covered:** live.

### TC-MER-05 — Ownership scoping ✅
- **Acceptance:** *Given* merchant A, *when* reading/editing/deleting merchant B's product, *then* `403` (service asserts `merchantId == actor.id`); A's product is untouched.
- **Covered:** `marketplace-integrity.test.ts`.

### TC-MER-06 — Sales feed ✅
- **Acceptance:** `GET /api/merchant/sales` `200`, paginated; only line items for **this** merchant's products.
- **Covered:** live.

### TC-MER-07 — Product form UX ✅
- **Acceptance:** *Given* the create/edit form, *when* a field is invalid (price ≤ 0, name < 2, description < 10 chars), *then* inline errors block submit (`onSubmit` not called); price in **dollars** is sent as integer **cents** with float error rounded away (`19.99 → 1999`); an existing product pre-fills price as dollars and round-trips; blank image URL → `undefined`.
- **Covered:** `packages/ui` `ProductForm.test.tsx` (6 cases) + Zod + story states.

---

## 6. Admin console (role ADMIN)

### TC-ADM-01 — Platform stats ✅
- **Acceptance:** ADMIN → `GET /api/admin/stats` `200` (users, merchants, products, orders, revenue, charts).
- **Covered:** `access-control.test.ts` · live.

### TC-ADM-02 — List users / products ✅
- **Acceptance:** `GET /api/admin/users` and `/api/admin/products` → `200`, paginated, filterable.
- **Covered:** live.

### TC-ADM-03 — Change a user's role ✅
- **Acceptance:** *When* `PATCH /api/admin/users/:id/role {role}`, *then* `200`; the promoted user gains the new role's access **on next login** (role is carried in the JWT — existing sessions keep their old role until refreshed).
- **Covered:** `marketplace-integrity.test.ts`.

### TC-ADM-04 — Moderate a product ✅
- **Acceptance:** *When* `PATCH /api/admin/products/:id {isActive:false}`, *then* `200` and the product is hidden from the storefront.
- **Covered:** live.

### TC-ADM-05 — Self-protection (UX)
- **Acceptance:** *Given* the admin's own row, *then* the role selector / delete action is disabled for self.
- **Covered:** admin users page (`u.id === me.id` guard).

---

## 7. Access control & security

### TC-SEC-01 — Unauthenticated → 401 ✅
- **Acceptance:** *Given* no cookie, *when* hitting `/api/orders`, `/api/merchant/*`, `/api/admin/*`, *then* `401`. (`/api/cart` is deliberately guest-allowed — see TC-CART-06 — so it returns `200`, not `401`.)
- **Covered:** `access-control.test.ts` · live.

### TC-SEC-02 — USER forbidden from merchant & admin → 403 ✅
- **Acceptance:** *Given* a USER token, *when* hitting `/api/merchant/stats` or `/api/admin/*`, *then* `403`.
- **Covered:** `access-control.test.ts` · live.

### TC-SEC-03 — MERCHANT forbidden from admin → 403 ✅
- **Acceptance:** *Given* a MERCHANT token, *when* hitting `/api/admin/stats`, *then* `403`; their own `/api/merchant/stats` → `200`.
- **Covered:** `access-control.test.ts` · live.

### TC-SEC-04 — CORS allowlist ✅
- **Acceptance:** *Given* `Origin: http://localhost:3000` (allowlisted), *then* response carries `Access-Control-Allow-Origin` reflecting it + `Allow-Credentials: true`. *Given* `Origin: http://evil.com`, *then* **no** allow-origin header (browser blocks) and the preflight does **not** 500.
- **Covered:** live (header inspection).

### TC-SEC-05 — Auth cookie hardening ✅
- **Acceptance:** the `token` cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in prod, `Path=/`; in prod `Domain=.app.com` shares it across subdomains. The JWT is never exposed to JS.
- **Covered:** `auth.controller.ts`; live `Set-Cookie` inspection.

### TC-SEC-06 — Rate limiting ✅
- **Acceptance:** auth endpoints limited to 20/15min, admin surface 100/15min, global 300/15min (disabled under test). Helmet security headers present on every response.
- **Covered:** `rateLimit.ts`; live (helmet headers observed).

### TC-SEC-07 — Frontend route gating ✅
- **Acceptance:** *Given* a visitor with no auth cookie, *when* visiting a protected route, *then* `proxy.ts` redirects to that app's `/login?redirect=…` (`307`): user `/orders` (the cart is guest-accessible — see TC-CART-06); merchant & admin everything except `/login`. *Given* a cookie that is forged/expired or for the wrong role, *then* the server (dashboard layout / orders page, via `getServerUser` + `redirectToLogin`) redirects to `/login?redirect=<the requested page, query included>` before any page HTML is rendered — no client-side "checking access" step. *Given* the API is unreachable or returns a 5xx while checking the session, *then* the page shows its error boundary with a retry instead of redirecting to `/login`, and the "signed out" state is not cached on the client. (Defense in depth — the API is the real boundary.)
- **Covered:** live (`307` redirects observed on all three apps).

### TC-SEC-08 — Wrong-audience login ✅
- **Acceptance:** *Given* a USER logging into the merchant or admin app, *then* a clear error, the just-created session is logged out, and no dashboard access.
- **Covered:** shared `LoginForm` `role` gate (`@shopwave/hooks`).

### TC-SEC-09 — No open redirect after login ✅
- **Acceptance:** *Given* `/login?redirect=<target>`, *when* login succeeds, *then* only same-app relative paths are followed; absolute (`https://…`), protocol-relative (`//…`) and `/login` targets fall back to `/`.
- **Covered:** `packages/hooks` `safeRedirect.test.ts` (3 cases).

---

## 8. API documentation

### TC-DOC-01 — Swagger UI & spec served ✅
- **Acceptance:** `GET /docs` renders Swagger UI; `GET /openapi.json` returns a valid OpenAPI 3 doc with **28 operations** across all tags, security schemes (cookie + bearer).
- **Covered:** live.

### TC-DOC-02 — Documentation is enforced ✅
- **Acceptance:** *Given* a mounted `/api/*` route, *when* it is **not** in the OpenAPI ROUTES table, *then* the docs-coverage test **fails** (and vice-versa). This guarantees every new service is documented.
- **Covered:** `openapi.coverage.test.ts` (3 cases).

---

## 9. Frontend apps & UX

### TC-FE-01 — Each app boots with its own identity ✅
- **Acceptance:** user `:3000` (title "Shopwave — Marketplace"), merchant `:3001` ("Shopwave Merchant"), admin `:3002` ("Shopwave Admin") each serve `200` on their public pages.
- **Covered:** live.

### TC-FE-02 — Storefront browse → detail → add to cart ✅
- **Acceptance:** *Given* the storefront, *when* a guest or logged-in USER clicks Add, *then* the item is added to their (session or account) cart and the badge updates. *Given* a guest on `/cart`, *then* the checkout button reads "Log in to checkout" and links to `/login?redirect=/cart`; after login the merged cart is shown.
- **Covered:** live (pages serve, gating works) + `cart-guest.test.ts` + hooks unit-level.

### TC-FE-03 — Shared UI: ProductCard states ✅
- **Acceptance:** renders name/category/price; Add button calls `onAdd`; out-of-stock disables the button ("Sold out"); non-buyers see no Add button.
- **Covered:** `packages/ui` `ProductCard.test.tsx` (4 cases) + stories.

### TC-FE-04 — Shared UI: DashboardShell ✅
- **Acceptance:** renders title, nav items, children; marks the active route; falls back to `<a>` when no `LinkComponent`.
- **Covered:** `packages/ui` `DashboardShell.test.tsx` (3 cases) + stories.

### TC-FE-05 — Theming (light/dark/system) ✅
- **Acceptance:** toggle cycles light → dark → system; choice persists; no flash of wrong theme on reload (inline no-flash script, and the provider never applies a theme before reading the stored one); the theme-toggle icon animates on change.
- **Covered:** `@shopwave/hooks` `useTheme` + `themeNoFlashScript`; manual.

### TC-FE-06 — Motion is accessible ✅
- **Acceptance:** page transitions, grid stagger, badge pop, theme-icon spin and theme cross-fade, chart fade-in and cart-row exit are present; entrances animate only `opacity`/`transform` and play on server-rendered HTML (no `opacity:0` waiting on JS); loading states appear only after ~150ms; *given* OS "reduce motion", *then* every animation is suppressed (spinners excepted).
- **Covered:** live — headless Chrome with `prefers-reduced-motion: reduce` measures `animation-duration` ≈ 0 and `scroll-behavior: auto`; `Stagger.test.tsx` (delays).

### TC-FE-07 — Responsive layout ✅
- **Acceptance:** storefront grid is 2/3/4 columns at sm/md/lg; dashboards show a sidebar on desktop and a scrollable tab strip on mobile.
- **Covered:** Tailwind classes; manual visual check.

### TC-FE-08 — Shared toast & error display ✅
- **Acceptance:** *Given* a failed action (e.g. wrong login, oversell, network error), *when* it returns, *then* a toast shows the **API's actual message** (via `notify.error` → `getErrorMessage`, which unwraps `{error:{message}}`) — never a raw stack or generic "Error". Success actions show a success toast. One `<Toaster/>` + `notify` API is shared by all three apps (`@shopwave/hooks`).
- **Covered:** `notify` + `getErrorMessage`; live (wrong-password / 403 / oversell return real messages).

### TC-FE-09 — Global query-error surfacing ✅
- **Acceptance:** *Given* a read (GET) that fails, *when* the query errors, *then* a toast appears automatically (QueryCache `onError`) instead of failing silently; a query may opt out with `meta.silent`.
- **Covered:** `AppProviders` QueryCache handler.

### TC-FE-10 — Route error boundary ✅
- **Acceptance:** *Given* a render/data error in a route, *when* it throws, *then* the app shows the shared `ErrorState` panel with a **"Try again"** button (calls `reset()`) instead of a blank screen; the error is logged for monitoring.
- **Covered:** per-app `error.tsx` + `@shopwave/ui` `ErrorState` (+ test).

### TC-FE-11 — Not-found (404) page ✅
- **Acceptance:** *When* visiting an unknown route, *then* the app responds `404` and renders the "Page not found" `ErrorState` with a **Go home** link.
- **Covered:** per-app `not-found.tsx`; live (`404` + "Page not found" on `/this-route-does-not-exist`).

### TC-FE-13 — Server-rendered pages hydrate without refetching ✅
- **Acceptance:** *Given* any page (catalogue, product, orders, dashboards), *then* the first HTML already contains its data (products, orders, stats, table rows, the signed-in navbar) and the browser does not refetch it on load; *given* filters/pagination, *then* they live in the URL (`?category=Audio&page=2`), are server-rendered on reload and restored by Back; there are no hydration warnings in the console.
- **Covered:** live (HTML inspection + headless Chrome: URL updates, Back, zero console errors); `useUrlFilters.test.ts`, `searchParams.test.ts`, `queries.test.ts`, `queryKeys.test.ts`.

### TC-FE-14 — Storefront SEO ✅
- **Acceptance:** product pages have their own `<title>`, description, canonical URL and Open Graph image; an unknown product returns HTTP `404` (for browsers and crawlers); `/sitemap.xml` lists every active product; `/robots.txt` disallows cart/orders/auth; merchant & admin apps send `noindex, nofollow`.
- **Covered:** live (`curl` against production builds).

### TC-FE-12 — API error envelope is production-safe ✅
- **Acceptance:** *Given* any backend error, *then* the response is `{ error: { message, details? } }`; **no stack traces** in production; unique-constraint → `409`, missing record → `404`, unexpected → `500` (logged). The frontend reads this consistent shape everywhere.
- **Covered:** `apps/api/src/middleware/error.ts` + `ApiError`.

---

## 10. Build, types & monorepo health

### TC-BLD-01 — Typecheck ✅
- **Acceptance:** `pnpm typecheck` passes for all 9 workspaces.
- **Covered:** live (`9 successful`).

### TC-BLD-02 — Build ✅
- **Acceptance:** `pnpm build` compiles the API and all three Next apps with no errors.
- **Covered:** live.

### TC-BLD-03 — Tests green ✅
- **Acceptance:** `pnpm test` runs 135 cases (41 API + 63 UI + 19 hooks + 8 api-client + 4 user), all passing — gated in CI alongside `pnpm lint`, `pnpm typecheck` and `pnpm build` ([.github/workflows/ci.yml](../.github/workflows/ci.yml)).
- **Covered:** live.

---

## Open follow-ups (recommended additional automated coverage)

- ✅ **TC-CHK-05 / TC-MER-05 / TC-ADM-03** — now automated in `marketplace-integrity.test.ts` (price-snapshot immutability, cross-merchant isolation, role-change-on-next-login).
- ✅ **TC-MER-07** — `ProductForm.test.tsx` covers dollars→cents conversion, float rounding, pre-fill round-trip, optional image, and validation gating.

All previously-flagged follow-ups are now automated.
