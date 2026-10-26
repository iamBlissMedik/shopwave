# @shopwave/api-client

The platform's **transport layer**. Framework-agnostic (no React) and built on the platform `fetch`, so the **same code runs in the browser and in Server Components** — no HTTP library is shipped to the client. Centralizing it means the auth cookie, error envelope and timeouts live in one place every app shares.

It is deliberately thin: it owns the `Http` transport plus the one endpoint group common to every app — **`auth`**. Each app builds and owns its own domain endpoints (`products`, `cart`, `orders`, `merchant`, `admin`) on top of this transport, under that app's `src/api`. The storefront never ships merchant/admin code, and vice-versa.

```ts
import { createHttp, authEndpoints, type Http } from '@shopwave/api-client';

// Browser: send/store the httpOnly auth cookie cross-origin.
const http = createHttp({ baseURL: 'https://api.app.com/api', credentials: 'include' });

// Server Component: call the API as the visitor (see @shopwave/hooks/server).
const serverHttp = createHttp({ baseURL: process.env.API_URL!, headers: { cookie } });

await authEndpoints(http).me();
```

| Export | Purpose |
| --- | --- |
| `createHttp(options)` | Typed `get/post/patch/delete` over `fetch` (`baseURL`, `headers`, `credentials`, `timeoutMs`); never HTTP-cached |
| `HttpError` | Thrown for failed requests: the API's own `{ error: { message } }` text + `status` (`0` = network / timeout) |
| `getErrorMessage(err)` | Any thrown value → a display string |
| `authEndpoints(http)` | Shared auth: `me`, `login`, `register`, `logout` |
| `Http` (type) | The transport shape each app's endpoint factories accept |

> **Adding an endpoint?** If it's used by more than one app (like `auth`), add it here. Otherwise add it to the owning app's `src/api/*.ts` factory and wire it into that app's `src/api/create.ts`.
