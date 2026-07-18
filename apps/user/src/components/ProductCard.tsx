'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@shopwave/types';
import { useAuth } from '@shopwave/hooks';
import { useAddToCart } from '@/hooks';
import { ProductCard as UIProductCard } from '@shopwave/ui';

/**
 * Storefront product tile: wires the presentational `@shopwave/ui` ProductCard
 * to cart/auth data and injects Next's optimized `Image`/`Link`.
 */
export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const addToCart = useAddToCart();
  // Guests and customers can add to cart; merchant/admin accounts cannot.
  const canBuy = !user || user.role === 'USER';

  // Guests get a server-side session cart (merged into their account on login).
  const handleAdd = () => addToCart.mutate({ productId: product.id, quantity: 1 });

  return (
    <UIProductCard
      product={product}
      href={`/products/${product.id}`}
      canBuy={canBuy}
      isAdding={addToCart.isPending}
      onAdd={handleAdd}
      LinkComponent={({ href, className, children }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
      ImageComponent={({ src, alt, className }) => (
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 25vw" className={className} />
      )}
    />
  );
}
