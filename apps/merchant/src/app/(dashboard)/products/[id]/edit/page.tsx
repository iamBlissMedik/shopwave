'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '@shopwave/ui';
import { useMerchantProduct, useUpdateProduct } from '@shopwave/hooks';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useMerchantProduct(id);
  const update = useUpdateProduct();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <h1 className="text-2xl font-bold">Edit product</h1>

      {isLoading && <p className="py-12 text-center text-muted">Loading…</p>}
      {isError && <p className="py-12 text-center text-danger">Product not found.</p>}
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
