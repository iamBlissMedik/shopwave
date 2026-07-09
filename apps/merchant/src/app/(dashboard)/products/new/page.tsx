'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '@shopwave/ui';
import { useCreateProduct } from '@shopwave/hooks';

export default function NewProductPage() {
  const create = useCreateProduct();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm onSubmit={(payload) => create.mutate(payload)} isSubmitting={create.isPending} submitLabel="Create product" />
    </div>
  );
}
