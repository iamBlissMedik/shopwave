import type { MerchantStats, Paginated, Product, ProductPayload, Sale } from '@shopwave/types';
import type { Http } from '../client';

export type { ProductPayload };

export interface MerchantProductFilters {
  page?: number;
  limit?: number;
  search?: string;
}

/** MERCHANT-only dashboard endpoints. */
export function merchantEndpoints(http: Http) {
  return {
    stats: () => http.get<MerchantStats>('/merchant/stats'),
    products: (filters: MerchantProductFilters) =>
      http.get<Paginated<Product>>('/merchant/products', filters),
    product: (id: string) =>
      http.get<{ product: Product }>(`/merchant/products/${id}`).then((d) => d.product),
    sales: (page = 1) => http.get<Paginated<Sale>>('/merchant/sales', { page }),
    createProduct: (payload: ProductPayload) =>
      http.post<{ product: Product }>('/merchant/products', payload),
    updateProduct: (id: string, payload: Partial<ProductPayload> & { isActive?: boolean }) =>
      http.patch<{ product: Product }>(`/merchant/products/${id}`, payload),
    deleteProduct: (id: string) => http.delete<{ message: string }>(`/merchant/products/${id}`),
  };
}
