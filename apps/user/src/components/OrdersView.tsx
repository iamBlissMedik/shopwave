'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { Package } from 'lucide-react';
import { useUrlFilters } from '@shopwave/hooks';
import { useOrders } from '@/hooks';
import { parseOrdersFilters } from '@/queries';
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  Pagination,
  buttonClasses,
  formatDate,
  formatPrice,
  statusTone,
} from '@shopwave/ui';

/** The signed-in customer's order history, paginated through the URL (`?page=`). */
export function OrdersView() {
  const [{ page }, setFilters] = useUrlFilters(parseOrdersFilters);
  const { data, isLoading, isPlaceholderData } = useOrders(page);

  if (isLoading) return <LoadingState message="Loading orders…" />;

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        headingLevel="h1"
        title="No orders yet"
        message="When you check out, your orders will show up here."
      >
        <Link href="/" className={buttonClasses()}>
          Start shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your orders</h1>

      <div
        aria-busy={isPlaceholderData || undefined}
        className={clsx(
          'space-y-4 transition-opacity duration-200',
          isPlaceholderData && 'opacity-60',
        )}
      >
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

      <Pagination meta={data.meta} onPageChange={(next) => setFilters({ page: next })} />
    </div>
  );
}
