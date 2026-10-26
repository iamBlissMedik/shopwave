import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { HttpError } from '@shopwave/api-client';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { productQuery } from '@/queries';
import { EditProductView } from '@/components/EditProductView';

export const metadata: Metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: PageProps<'/products/[id]/edit'>) {
  const { id } = await params;
  const api = await getServerApi();
  const queryClient = makeServerQueryClient();
  try {
    await queryClient.fetchQuery(productQuery(api, id));
  } catch (error) {
    // Missing, or owned by another store: both are "not yours to edit".
    if (error instanceof HttpError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditProductView id={id} />
    </HydrationBoundary>
  );
}
