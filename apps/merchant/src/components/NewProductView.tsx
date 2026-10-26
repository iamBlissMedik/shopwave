'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '@shopwave/ui';
import { useCreateProduct } from '@/hooks';

/** Create-product form. */
export function NewProductView() {
  const create = useCreateProduct();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft size={16} aria-hidden /> Back to products
      </Link>
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm
        onSubmit={(payload) => create.mutate(payload)}
        isSubmitting={create.isPending}
        submitLabel="Create product"
      />
    </div>
  );
}
