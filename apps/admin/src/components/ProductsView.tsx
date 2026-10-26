'use client';

import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  Select,
  formatPrice,
  statusTone,
  type Column,
} from '@shopwave/ui';
import { useUrlFilters } from '@shopwave/hooks';
import { useAdminProducts, useModerateProduct, type AdminProductFilters } from '@/hooks';
import { parseProductFilters } from '@/queries';
import type { Product } from '@shopwave/types';

/** Catalogue-wide moderation: every store's products, filterable through the URL. */
export function ProductsView() {
  const [filters, setFilters] = useUrlFilters(parseProductFilters);
  const { data, isLoading, isPlaceholderData } = useAdminProducts(filters);
  const moderate = useModerateProduct();

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:block">
            <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
          </div>
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    { header: 'Store', cell: (p) => p.merchant?.storeName ?? p.merchant?.name ?? '—' },
    { header: 'Category', cell: (p) => p.category },
    { header: 'Price', cell: (p) => formatPrice(p.price) },
    { header: 'Stock', cell: (p) => p.stock },
    {
      header: 'Status',
      cell: (p) => (
        <Badge tone={statusTone[p.isActive ? 'active' : 'inactive']}>
          {p.isActive ? 'Active' : 'Hidden'}
        </Badge>
      ),
    },
    {
      header: 'Moderate',
      className: 'text-right',
      cell: (p) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moderate.mutate({ id: p.id, isActive: !p.isActive })}
        >
          {p.isActive ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
          {p.isActive ? 'Hide' : 'Show'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      <FilterBar
        search={filters.search ?? ''}
        onSearch={(search) => setFilters({ search: search || undefined })}
        searchPlaceholder="Search products…"
      >
        <Select
          aria-label="Status"
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters({ status: (e.target.value || undefined) as AdminProductFilters['status'] })
          }
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        isFetching={isPlaceholderData}
        emptyMessage="No products found."
        meta={data?.meta}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
}
