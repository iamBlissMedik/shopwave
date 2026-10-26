import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import { HttpError } from '@shopwave/api-client';
import { formatPrice } from '@shopwave/ui';
import { getServerApi } from '@/api/server';
import { AddToCartButton } from '@/components/AddToCartButton';

/**
 * Product detail — fully server-rendered (crawlable, with real metadata); only
 * the add-to-cart button ships as client JavaScript. `cache` shares one API
 * call between `generateMetadata` and the page within a request.
 */
const getProduct = cache(async (id: string) => {
  const api = await getServerApi();
  try {
    return await api.products.get(id);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<'/products/[id]'>): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.imageUrl, width: 600, height: 600, alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<'/products/[id]'>) {
  const product = await getProduct((await params).id);
  const outOfStock = product.stock <= 0;

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft size={16} aria-hidden /> Back to products
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            preload
          />
        </div>

        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">
            {product.category}
          </span>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          {product.merchant?.storeName && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
              <Store size={14} aria-hidden /> Sold by {product.merchant.storeName}
            </p>
          )}
          <p className="mt-4 text-2xl font-bold">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <span className="font-medium text-danger">Out of stock</span>
            ) : (
              <span className="text-success">{product.stock} in stock</span>
            )}
          </p>

          <AddToCartButton productId={product.id} outOfStock={outOfStock} />
        </div>
      </div>
    </div>
  );
}
