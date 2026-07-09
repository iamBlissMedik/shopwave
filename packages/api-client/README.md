# @shopwave/api-client

The **one** API client for the platform. Framework-agnostic (no React) — used by `@shopwave/hooks` and importable directly. Centralizing it means the auth cookie, error envelope, timeouts and (future) token refresh live in a single place that every app shares.

```ts
import { createApiClient, createHttp, createEndpoints } from '@shopwave/api-client';

const http = createHttp(createApiClient({ baseURL: 'https://api.app.com/api' }));
const api = createEndpoints(http);

await api.products.list({ page: 1, sort: 'newest' });
await api.cart.addItem({ productId, quantity: 1 });
```

| Module | Endpoints |
| --- | --- |
| `api.auth` | `me`, `login`, `register`, `logout` |
| `api.products` | `list`, `get`, `categories` |
| `api.cart` | `get`, `addItem`, `updateItem`, `removeItem` |
| `api.orders` | `list`, `checkout` |
| `api.merchant` | `stats`, `products`, `product`, `sales`, `createProduct`, `updateProduct`, `deleteProduct` |
| `api.admin` | `stats`, `users`, `products`, `updateUserRole`, `deleteUser`, `moderateProduct` |

`getErrorMessage(err)` normalizes the API's `{ error: { message } }` envelope into a display string.

> **Adding an endpoint?** Add it to the matching `src/endpoints/*.ts` factory so every app gets it typed. (See the root `CONTRIBUTING.md` service checklist.)
