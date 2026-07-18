import type { Paginated, Product } from '@shopwave/types';
import type { Http } from '@shopwave/api-client';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

/** Public catalogue endpoints. */
export function productEndpoints(http: Http) {
  return {
    list: (filters: ProductFilters) => http.get<Paginated<Product>>('/products', filters),
    get: (id: string) => http.get<{ product: Product }>(`/products/${id}`).then((d) => d.product),
    categories: () =>
      http.get<{ categories: string[] }>('/products/categories').then((d) => d.categories),
  };
}
