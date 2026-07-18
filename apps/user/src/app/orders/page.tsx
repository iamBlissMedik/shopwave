'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/hooks';
import { Pagination, Card, Badge, formatPrice, formatDate, statusTone, LoadingState } from '@shopwave/ui';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  if (isLoading) return <LoadingState message="Loading orders…" />;

  if (!data || data.data.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="mt-2 text-muted">When you check out, your orders will show up here.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 font-medium text-brand-fg hover:opacity-90">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your orders</h1>

      <div className="space-y-4">
        {data.data.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm text-muted">#{order.id.slice(-8)}</p>
                <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
              </div>
              <Badge tone={statusTone[order.status]}>{order.status}</Badge>
            </div>

            <ul className="mt-4 divide-y divide-border border-y border-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-foreground">
                    {item.product.name} <span className="text-muted">× {item.quantity}</span>
                  </span>
                  <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </Card>
        ))}
      </div>

      <Pagination meta={data.meta} onPageChange={setPage} />
    </div>
  );
}
