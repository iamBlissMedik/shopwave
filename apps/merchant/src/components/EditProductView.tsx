'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ErrorState, LoadingState, ProductForm } from '@shopwave/ui';
import { useMerchantProduct, useUpdateProduct } from '@/hooks';

/** Edit form for one of the merchant's products (prefetched on the server). */
export function EditProductView({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useMerchantProduct(id);
  const update = useUpdateProduct();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft size={16} aria-hidden /> Back to products
      </Link>
      <h1 className="text-2xl font-bold">Edit product</h1>

      {isLoading && <LoadingState />}
      {isError && (
        <ErrorState
          title="Product not found"
          message="It may have been removed, or it belongs to another store."
        />
      )}
      {product && (
        <ProductForm
          initial={product}
          onSubmit={(payload) => update.mutate({ id, payload })}
          isSubmitting={update.isPending}
          submitLabel="Save changes"
        />
      )}
    </div>
  );
}
