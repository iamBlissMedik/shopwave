'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveCartItem, useCheckout } from '@shopwave/hooks';
import { Button, Card, formatPrice, easeOut } from '@shopwave/ui';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const checkout = useCheckout();

  if (isLoading) return <p className="py-12 text-center text-muted">Loading cart…</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Browse the marketplace and add something you like.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 font-medium text-brand-fg hover:opacity-90">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
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
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="80px" className="object-cover" />
              </div>

              <div className="flex flex-1 flex-col">
                <Link href={`/products/${item.productId}`} className="font-medium text-foreground hover:underline">
                  {item.product.name}
                </Link>
                <span className="text-sm text-muted">{formatPrice(item.product.price)} each</span>

                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateItem.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 1 || updateItem.isPending}
                      className="px-2 py-1 text-foreground disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm text-foreground">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                      disabled={item.quantity >= item.product.stock || updateItem.isPending}
                      className="px-2 py-1 text-foreground disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem.mutate({ productId: item.productId })}
                    className="flex items-center gap-1 text-sm text-danger hover:underline"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>

              <div className="font-semibold text-foreground">{formatPrice(item.lineTotal)}</div>
            </Card>
            </motion.div>
          ))}
          </AnimatePresence>
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
          <Button onClick={() => checkout.mutate()} isLoading={checkout.isPending} className="mt-6 w-full">
            Checkout
          </Button>
          <p className="mt-2 text-center text-xs text-muted">Demo checkout — no real payment is taken.</p>
        </Card>
      </div>
    </div>
  );
}
