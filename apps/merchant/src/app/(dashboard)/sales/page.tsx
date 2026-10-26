import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { parseSalesFilters, salesQuery } from '@/queries';
import { SalesView } from '@/components/SalesView';

export const metadata: Metadata = { title: 'Sales' };

export default async function SalesPage({ searchParams }: PageProps<'/sales'>) {
  const { page } = parseSalesFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(salesQuery(await getServerApi(), page));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SalesView />
    </HydrationBoundary>
  );
}
