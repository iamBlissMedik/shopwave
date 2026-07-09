# @shopwave/types

Framework-agnostic (no React) domain types and shared Zod form schemas that mirror the API contract. Imported by `@shopwave/api-client`, `@shopwave/hooks`, `@shopwave/ui`, and all three apps.

```ts
import type { Product, Cart, Order, Role } from '@shopwave/types';
import { loginSchema, registerSchema, productSchema } from '@shopwave/types';
```

- `dto.ts` — response DTOs (`User`, `Product`, `Cart`, `Order`, `MerchantStats`, `AdminStats`, …).
- `validations.ts` — Zod schemas for the login / register / product forms, plus their inferred `*Values` types.

> These DTOs are hand-maintained to match the API. When you change an API response shape, update the matching type here.
