'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Plus, Eye, EyeOff } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  buttonClasses,
  formatPrice,
  statusTone,
  type Column,
} from '@shopwave/ui';
import { useUrlFilters } from '@shopwave/hooks';
import { useMerchantProducts, useUpdateProduct } from '@/hooks';
import { parseProductFilters } from '@/queries';
import type { Product } from '@shopwave/types';

/** The merchant's catalogue (active + hidden), searchable and paginated through the URL. */
export function ProductsView() {
  const [filters, setFilters] = useUrlFilters(parseProductFilters);
  const { data, isLoading, isPlaceholderData } = useMerchantProducts(filters);
  const update = useUpdateProduct();

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
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/products/${p.id}/edit`}
            className={buttonClasses({ variant: 'secondary', size: 'sm' })}
          >
            <Pencil size={14} aria-hidden /> Edit
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update.mutate({ id: p.id, payload: { isActive: !p.isActive } })}
          >
            {p.isActive ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
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
        <Link href="/products/new" className={buttonClasses({ size: 'sm' })}>
          <Plus size={16} aria-hidden /> Add product
        </Link>
      </div>

      <FilterBar
        search={filters.search ?? ''}
        onSearch={(search) => setFilters({ search: search || undefined })}
        searchPlaceholder="Search your products…"
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        isFetching={isPlaceholderData}
        emptyMessage="No products yet — add your first one."
        meta={data?.meta}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
}
