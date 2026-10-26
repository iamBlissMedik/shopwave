'use client';

import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@shopwave/hooks';
import { Button } from '@shopwave/ui';
import { useAddToCart } from '@/hooks';

/**
 * The product page's only interactive piece. Guests and customers can buy
 * (guests get a server-side session cart, merged into their account on login);
 * merchant/admin accounts don't see the button.
 */
export function AddToCartButton({
  productId,
  outOfStock,
}: {
  productId: string;
  outOfStock: boolean;
}) {
  const { user } = useAuth();
  const addToCart = useAddToCart();

  if (user && user.role !== 'USER') return null;

  return (
    <Button
      onClick={() => addToCart.mutate({ productId, quantity: 1 })}
      disabled={outOfStock}
      isLoading={addToCart.isPending}
      className="mt-6 w-full sm:w-auto"
    >
      <ShoppingCart size={18} aria-hidden /> Add to cart
    </Button>
  );
}
