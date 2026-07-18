# @shopwave/api-client

The platform's **transport layer**. Framework-agnostic (no React) — used by `@shopwave/hooks` and every app. Centralizing it means the auth cookie, error envelope, timeouts and (future) token refresh live in one place that every app shares.

It is deliberately thin: it owns the client factory and typed `http` helpers, plus the one endpoint group common to every app — **`auth`**. Each app builds and owns its own domain endpoints (`products`, `cart`, `orders`, `merchant`, `admin`) on top of this transport, under that app's `src/api`. The storefront never ships merchant/admin code, and vice-versa.

```ts
import { createApiClient, createHttp, authEndpoints, type Http } from '@shopwave/api-client';

const http = createHttp(createApiClient({ baseURL: 'https://api.app.com/api' }));

// shared, everywhere:
const api = { auth: authEndpoints(http) };
await api.auth.me();

// each app then adds its own domains on the same `http`:
//   const api = { auth: authEndpoints(http), products: productEndpoints(http), ... }
```

| Export | Purpose |
| --- | --- |
| `createApiClient({ baseURL })` | Configured axios instance (`withCredentials`, timeout, JSON) |
| `createHttp(instance)` | Typed `get/post/patch/delete` helpers that unwrap `response.data` |
| `authEndpoints(http)` | Shared auth: `me`, `login`, `register`, `logout` |
| `getErrorMessage(err)` | Normalizes the API's `{ error: { message } }` envelope into a display string |
| `Http` (type) | The helper shape each app's endpoint factories accept |

> **Adding an endpoint?** If it's used by more than one app (like `auth`), add it here. Otherwise add it to the owning app's `src/api/*.ts` factory — see that app's `src/api/index.ts`. (Cross-cutting concerns like the error envelope still live here.)
