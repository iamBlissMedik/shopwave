// Domain DTOs mirroring the API response contract.
// Single source of truth shared by the user, merchant and admin apps.

export type Role = 'USER' | 'MERCHANT' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeName: string | null;
}

/** Lightweight store info embedded in public product responses. */
export interface MerchantRef {
  id: string;
  name: string;
  storeName: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  imageUrl: string;
  category: string;
  stock: number;
  isActive: boolean;
  merchantId: string;
  merchant?: MerchantRef;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CartLine {
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number; // cents
}

export interface Cart {
  items: CartLine[];
  subtotal: number; // cents
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

/** Create/update product input (price already in cents). Shared by the form, client and hooks. */
export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

// ---- Merchant dashboard ----
export interface DailyPoint {
  date: string; // yyyy-mm-dd
  value: number; // cents
}

export interface MerchantStats {
  totals: {
    totalProducts: number;
    activeProducts: number;
    lowStock: number;
    unitsSold: number;
    totalRevenue: number;
  };
  revenueByDay: DailyPoint[];
  topProducts: { name: string; revenue: number }[];
}

export interface Sale {
  id: string;
  orderId: string;
  product: { id: string; name: string; imageUrl: string };
  quantity: number;
  revenue: number;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
}

// ---- Admin console ----
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeName: string | null;
  createdAt: string;
  _count: { products: number; orders: number };
}

export interface AdminStats {
  totals: { users: number; merchants: number; products: number; orders: number; revenue: number };
  usersByRole: { role: Role; count: number }[];
  revenueByDay: DailyPoint[];
}
