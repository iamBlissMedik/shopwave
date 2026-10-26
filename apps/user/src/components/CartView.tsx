'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useAuth } from '@shopwave/hooks';
import { useCart, useUpdateCartItem, useRemoveCartItem, useCheckout } from '@/hooks';
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  buttonClasses,
  easeOut,
  formatPrice,
} from '@shopwave/ui';

/**
 * The cart: animated line items (rows slide out on remove, the rest reflow
 * smoothly — the one place layout/exit animation needs JS, so Framer Motion is
 * only loaded on this route), plus the order summary and checkout.
 */
export function CartView() {
  const { user, status: authStatus } = useAuth();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const checkout = useCheckout();

  if (isLoading || authStatus === 'loading') return <LoadingState message="Loading cart…" />;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        headingLevel="h1"
        title="Your cart is empty"
        message="Browse the marketplace and add something you like."
      >
        <Link href="/" className={buttonClasses()}>
          Continue shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <Card className="flex gap-4 p-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-sm text-muted">
                        {formatPrice(item.product.price)} each
                      </span>

                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            onClick={() =>
                              updateItem.mutate({
                                productId: item.productId,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1 || updateItem.isPending}
                            className="px-2 py-1 text-foreground disabled:opacity-40"
                          >
                            <Minus size={14} aria-hidden />
                          </button>
                          <span
                            className="w-8 text-center text-sm text-foreground"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.product.name}`}
                            onClick={() =>
                              updateItem.mutate({
                                productId: item.productId,
                                quantity: item.quantity + 1,
                              })
                            }
                            disabled={item.quantity >= item.product.stock || updateItem.isPending}
                            className="px-2 py-1 text-foreground disabled:opacity-40"
                          >
                            <Plus size={14} aria-hidden />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem.mutate({ productId: item.productId })}
                          disabled={removeItem.isPending}
                          className="flex items-center gap-1 text-sm text-danger hover:underline disabled:opacity-40"
                        >
                          <Trash2 size={14} aria-hidden /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="font-semibold text-foreground">
                      {formatPrice(item.lineTotal)}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </MotionConfig>
        </div>

        <Card className="h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm text-muted">
            <span>Items ({cart.itemCount})</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="my-3 border-t border-border" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          {user ? (
            <Button
              onClick={() => checkout.mutate()}
              isLoading={checkout.isPending}
              className="mt-6 w-full"
            >
              Checkout
            </Button>
          ) : authStatus === 'signed-out' ? (
            // Guests keep their cart: it merges into the account on login.
            <Link
              href="/login?redirect=/cart"
              className={buttonClasses({ className: 'mt-6 w-full' })}
            >
              Log in to checkout
            </Link>
          ) : (
            // Session unknown (API unreachable): don't ask a signed-in shopper to log in.
            <Button disabled className="mt-6 w-full">
              Checkout unavailable — try again shortly
            </Button>
          )}
          <p className="mt-2 text-center text-xs text-muted">
            Demo checkout — no real payment is taken.
          </p>
        </Card>
      </div>
    </div>
  );
}
