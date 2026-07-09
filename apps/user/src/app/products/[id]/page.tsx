'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Store } from 'lucide-react';
import { useProduct, useAddToCart, useAuth } from '@shopwave/hooks';
import { Button, formatPrice } from '@shopwave/ui';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: product, isLoading, isError } = useProduct(id);
  const addToCart = useAddToCart();

  if (isLoading) return <p className="py-12 text-center text-muted">Loading…</p>;
  if (isError || !product) return <p className="py-12 text-center text-danger">Product not found.</p>;

  const outOfStock = product.stock <= 0;
  // Guests and customers can add to cart; merchant/admin accounts cannot.
  const canBuy = !user || user.role === 'USER';

  // Guests get a server-side session cart (merged into their account on login).
  const handleAdd = () => addToCart.mutate({ productId: product.id, quantity: 1 });

  return (
    <div>
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority />
        </div>

        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">{product.category}</span>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          {product.merchant?.storeName && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
              <Store size={14} /> Sold by {product.merchant.storeName}
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

          {canBuy && (
            <Button onClick={handleAdd} disabled={outOfStock} isLoading={addToCart.isPending} className="mt-6 w-full sm:w-auto">
              <ShoppingCart size={18} /> Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
