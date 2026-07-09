'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Plus, Eye, EyeOff } from 'lucide-react';
import {
  Button,
  Badge,
  DataTable,
  FilterBar,
  statusTone,
  formatPrice,
  type Column,
} from '@shopwave/ui';
import { useMerchantProducts, useUpdateProduct, type MerchantProductFilters } from '@shopwave/hooks';
import type { Product } from '@shopwave/types';

export default function MerchantProductsPage() {
  const [filters, setFilters] = useState<MerchantProductFilters>({ page: 1, limit: 10 });
  const { data, isLoading } = useMerchantProducts(filters);
  const update = useUpdateProduct();

  const patch = (p: Partial<MerchantProductFilters>) =>
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
    { header: 'Category', cell: (p) => p.category },
    { header: 'Price', cell: (p) => formatPrice(p.price) },
    { header: 'Stock', cell: (p) => p.stock },
    {
      header: 'Status',
      cell: (p) => <Badge tone={statusTone[p.isActive ? 'active' : 'inactive']}>{p.isActive ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-2">
          <Link href={`/products/${p.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} /> Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update.mutate({ id: p.id, payload: { isActive: !p.isActive } })}
          >
            {p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
            {p.isActive ? 'Hide' : 'Show'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button size="sm">
            <Plus size={16} /> Add product
          </Button>
        </Link>
      </div>

      <FilterBar
        search={filters.search ?? ''}
        onSearch={(search) => patch({ search: search || undefined })}
        searchPlaceholder="Search your products…"
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No products yet — add your first one."
        meta={data?.meta}
        onPageChange={(page) => patch({ page })}
      />
    </div>
  );
}
