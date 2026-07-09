/**
 * OpenAPI 3 document for the Shopwave API.
 *
 * Built as a plain object from a single ROUTES table (rather than reflecting the
 * Zod validation schemas) so it has zero coupling to validation-library
 * internals and never breaks on a dependency bump. The same ROUTES table is the
 * source of truth the docs-coverage test checks every Express route against —
 * so adding a route without documenting it here fails CI.
 */

type Method = 'get' | 'post' | 'patch' | 'delete';
type JsonSchema = Record<string, unknown>;

export interface DocumentedRoute {
  method: Method;
  /** Full path incl. `/api`, OpenAPI `{param}` style, e.g. `/api/products/{id}`. */
  path: string;
  tag: string;
  summary: string;
  /** Requires a valid auth cookie/bearer token. */
  secure?: boolean;
  /** JSON Schema for the request body (mutating endpoints). */
  body?: JsonSchema;
  /** Query parameter names → JSON Schema. */
  query?: Record<string, JsonSchema>;
}

const str: JsonSchema = { type: 'string' };
const int: JsonSchema = { type: 'integer' };
const page = { page: int, limit: int };
const productBody: JsonSchema = {
  type: 'object',
  required: ['name', 'description', 'price', 'category'],
  properties: {
    name: str,
    description: str,
    price: { type: 'integer', description: 'Price in cents' },
    category: str,
    stock: int,
    imageUrl: { type: 'string', format: 'uri' },
  },
};

// PATCH bodies mirror `updateProductSchema`: every field optional (partial
// update) plus the `isActive` visibility toggle. Shared by the merchant and
// admin product-update docs so they can't drift from what the handler validates.
const productPatchBody: JsonSchema = {
  type: 'object',
  properties: {
    ...(productBody.properties as Record<string, JsonSchema>),
    isActive: { type: 'boolean' },
  },
};

/** Single source of truth for every documented route. */
export const ROUTES: DocumentedRoute[] = [
  // Auth
  { method: 'post', path: '/api/auth/register', tag: 'Auth', summary: 'Create a customer or merchant account', body: {
    type: 'object', required: ['name', 'email', 'password'], properties: {
      name: str, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 },
      role: { type: 'string', enum: ['USER', 'MERCHANT'] }, storeName: str,
    } } },
  { method: 'post', path: '/api/auth/login', tag: 'Auth', summary: 'Log in and receive the auth cookie', body: {
    type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: str } } },
  { method: 'post', path: '/api/auth/logout', tag: 'Auth', summary: 'Clear the auth cookie' },
  { method: 'get', path: '/api/auth/me', tag: 'Auth', summary: 'Get the current user', secure: true },

  // Products (public)
  { method: 'get', path: '/api/products', tag: 'Products', summary: 'List, filter and sort the catalogue', query: {
    ...page, search: str, category: str, minPrice: int, maxPrice: int,
    sort: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'name_asc'] } } },
  { method: 'get', path: '/api/products/categories', tag: 'Products', summary: 'List distinct categories' },
  { method: 'get', path: '/api/products/{id}', tag: 'Products', summary: 'Get a single product' },

  // Cart (guest or customer). Works anonymously via an httpOnly guest-session
  // cookie; on login/register the guest cart is merged into the account cart.
  { method: 'get', path: '/api/cart', tag: 'Cart', summary: 'Get the current cart (guest or user)' },
  { method: 'post', path: '/api/cart/items', tag: 'Cart', summary: 'Add an item to the cart (guest or user)', body: {
    type: 'object', required: ['productId'], properties: { productId: str, quantity: { type: 'integer', minimum: 1, maximum: 99 } } } },
  { method: 'patch', path: '/api/cart/items/{productId}', tag: 'Cart', summary: 'Change an item quantity', body: {
    type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 1, maximum: 99 } } } },
  { method: 'delete', path: '/api/cart/items/{productId}', tag: 'Cart', summary: 'Remove an item' },
  { method: 'delete', path: '/api/cart', tag: 'Cart', summary: 'Empty the cart' },

  // Orders (customer)
  { method: 'post', path: '/api/orders/checkout', tag: 'Orders', summary: 'Checkout the cart into an order (atomic)', secure: true },
  { method: 'get', path: '/api/orders', tag: 'Orders', summary: 'List your orders', secure: true, query: page },
  { method: 'get', path: '/api/orders/{id}', tag: 'Orders', summary: 'Get one of your orders', secure: true },

  // Merchant (MERCHANT only)
  { method: 'get', path: '/api/merchant/stats', tag: 'Merchant', summary: 'Store dashboard stats', secure: true },
  { method: 'get', path: '/api/merchant/sales', tag: 'Merchant', summary: 'Sales (order-item) feed', secure: true, query: page },
  { method: 'get', path: '/api/merchant/products', tag: 'Merchant', summary: 'List your products', secure: true, query: { ...page, search: str } },
  { method: 'get', path: '/api/merchant/products/{id}', tag: 'Merchant', summary: 'Get one of your products', secure: true },
  { method: 'post', path: '/api/merchant/products', tag: 'Merchant', summary: 'Create a product', secure: true, body: productBody },
  { method: 'patch', path: '/api/merchant/products/{id}', tag: 'Merchant', summary: 'Update a product', secure: true, body: productPatchBody },
  { method: 'delete', path: '/api/merchant/products/{id}', tag: 'Merchant', summary: 'Delete a product', secure: true },

  // Admin (ADMIN only)
  { method: 'get', path: '/api/admin/stats', tag: 'Admin', summary: 'Platform-wide stats', secure: true },
  { method: 'get', path: '/api/admin/users', tag: 'Admin', summary: 'List users', secure: true, query: {
    ...page, search: str, role: { type: 'string', enum: ['USER', 'MERCHANT', 'ADMIN'] } } },
  { method: 'patch', path: '/api/admin/users/{id}/role', tag: 'Admin', summary: "Change a user's role", secure: true, body: {
    type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['USER', 'MERCHANT', 'ADMIN'] } } } },
  { method: 'delete', path: '/api/admin/users/{id}', tag: 'Admin', summary: 'Delete a user', secure: true },
  { method: 'get', path: '/api/admin/products', tag: 'Admin', summary: 'List every product', secure: true, query: {
    ...page, search: str, status: { type: 'string', enum: ['active', 'inactive'] } } },
  { method: 'patch', path: '/api/admin/products/{id}', tag: 'Admin', summary: 'Moderate a product (show/hide)', secure: true, body: productPatchBody },
];

const secured = [{ cookieAuth: [] }, { bearerAuth: [] }];

/** Extract `{param}` path-parameter names from a route path. */
function pathParams(path: string): string[] {
  return [...path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
}

/** Build the full OpenAPI 3 document from the ROUTES table. */
export function buildOpenApiDocument() {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const r of ROUTES) {
    const op: Record<string, unknown> = {
      tags: [r.tag],
      summary: r.summary,
      responses: {
        '200': { description: 'Success' },
        '400': { description: 'Validation failed' },
        ...(r.secure ? { '401': { description: 'Authentication required' }, '403': { description: 'Insufficient permissions' } } : {}),
      },
    };
    if (r.secure) op.security = secured;

    const params = [
      ...pathParams(r.path).map((name) => ({ name, in: 'path', required: true, schema: str })),
      ...Object.entries(r.query ?? {}).map(([name, schema]) => ({ name, in: 'query', required: false, schema })),
    ];
    if (params.length) op.parameters = params;

    if (r.body) {
      op.requestBody = { required: true, content: { 'application/json': { schema: r.body } } };
    }

    paths[r.path] = { ...(paths[r.path] ?? {}), [r.method]: op };
  }

  return {
    openapi: '3.0.0',
    info: {
      title: 'Shopwave API',
      version: '1.0.0',
      description:
        'Multi-vendor marketplace API. Auth uses an httpOnly JWT cookie; every privileged route is role-guarded.',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local' }],
    tags: ['Auth', 'Products', 'Cart', 'Orders', 'Merchant', 'Admin'].map((name) => ({ name })),
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    paths,
  };
}
