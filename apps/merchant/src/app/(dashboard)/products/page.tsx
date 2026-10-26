import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { parseProductFilters, productsQuery } from '@/queries';
import { ProductsView } from '@/components/ProductsView';

export const metadata: Metadata = { title: 'Products' };

export default async function ProductsPage({ searchParams }: PageProps<'/products'>) {
  const filters = parseProductFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(productsQuery(await getServerApi(), filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsView />
    </HydrationBoundary>
  );
}
