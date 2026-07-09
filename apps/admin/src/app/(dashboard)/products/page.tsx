'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { Badge, Button, DataTable, FilterBar, statusTone, formatPrice, type Column } from '@shopwave/ui';
import { useAdminProducts, useModerateProduct, type AdminProductFilters } from '@shopwave/hooks';
import type { Product } from '@shopwave/types';

export default function AdminProductsPage() {
  const [filters, setFilters] = useState<AdminProductFilters>({ page: 1, limit: 10 });
  const { data, isLoading } = useAdminProducts(filters);
  const moderate = useModerateProduct();

  const patch = (p: Partial<AdminProductFilters>) =>
    setFilters((prev) => ({ ...prev, ...p, page: 'page' in p ? p.page! : 1 }));

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-muted sm:block">
            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
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
      cell: (p) => <Badge tone={statusTone[p.isActive ? 'active' : 'inactive']}>{p.isActive ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      header: 'Moderate',
      className: 'text-right',
      cell: (p) => (
        <Button variant="ghost" size="sm" onClick={() => moderate.mutate({ id: p.id, isActive: !p.isActive })}>
          {p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
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
        onSearch={(search) => patch({ search: search || undefined })}
        searchPlaceholder="Search products…"
      >
        <select
          value={filters.status ?? ''}
          onChange={(e) => patch({ status: (e.target.value || undefined) as 'active' | 'inactive' | undefined })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No products found."
        meta={data?.meta}
        onPageChange={(page) => patch({ page })}
      />
    </div>
  );
}
