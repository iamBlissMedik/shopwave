import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { getServerUser, makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { ordersQuery, parseOrdersFilters } from '@/queries';
import { OrdersView } from '@/components/OrdersView';

export const metadata: Metadata = { title: 'Your orders', robots: { index: false } };

export default async function OrdersPage({ searchParams }: PageProps<'/orders'>) {
  // The proxy only checks that a cookie exists; this verifies it is a live session.
  if (!(await getServerUser())) redirect('/login?redirect=/orders');

  const { page } = parseOrdersFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(ordersQuery(await getServerApi(), page));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersView />
    </HydrationBoundary>
  );
}
