import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { getServerUser, makeServerQueryClient, redirectToLogin } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { ordersQuery, parseOrdersFilters } from '@/queries';
import { OrdersView } from '@/components/OrdersView';

export const metadata: Metadata = { title: 'Your orders', robots: { index: false } };

export default async function OrdersPage({ searchParams }: PageProps<'/orders'>) {
  // The proxy only checks that a cookie exists; this verifies it is a live session.
  // An expired one returns here after login, page number included.
  if (!(await getServerUser())) await redirectToLogin();

  const { page } = parseOrdersFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(ordersQuery(await getServerApi(), page));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersView />
    </HydrationBoundary>
  );
}
