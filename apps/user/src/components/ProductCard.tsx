'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@shopwave/types';
import { useAuth } from '@shopwave/hooks';
import { useAddToCart } from '@/hooks';
import { ProductCard as UIProductCard, type ImageLike } from '@shopwave/ui';

/**
 * Next's optimized `Image` adapted to the card's image slot. Defined at module
 * scope (not inline) so its identity is stable and the image never remounts.
 */
const CardImage: ImageLike = ({ src, alt, className, loading }) => (
  <Image
    src={src}
    alt={alt}
    fill
    sizes="(max-width: 768px) 50vw, 25vw"
    loading={loading}
    className={className}
  />
);

/**
 * Storefront product tile: wires the presentational `@shopwave/ui` ProductCard
 * to cart/auth data and injects Next's `Link` and optimized `Image`.
 */
export function ProductCard({ product, eager }: { product: Product; eager?: boolean }) {
  const { user } = useAuth();
  const addToCart = useAddToCart();
  // Guests and customers can add to cart; merchant/admin accounts cannot.
  const canBuy = !user || user.role === 'USER';

  return (
    <UIProductCard
      product={product}
      href={`/products/${product.id}`}
      canBuy={canBuy}
      isAdding={addToCart.isPending}
      eager={eager}
      // Guests get a server-side session cart (merged into their account on login).
      onAdd={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
      LinkComponent={Link}
      ImageComponent={CardImage}
    />
  );
}
