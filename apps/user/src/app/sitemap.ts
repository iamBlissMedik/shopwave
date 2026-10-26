import type { MetadataRoute } from 'next';
import { getServerApi } from '@/api/server';
import { siteUrl } from '@/lib/site';

// Built per request from the live catalogue (never prerendered at build time,
// so building doesn't need a running API).
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100; // the API's maximum
const MAX_PAGES = 50; // 5,000 products — split into a sitemap index beyond that

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const api = await getServerApi();
  const list = (page: number) => api.products.list({ page, limit: PAGE_SIZE });

  // Page 1 tells us how many pages there are; fetch the rest in parallel.
  const first = await list(1);
  const lastPage = Math.min(first.meta.totalPages, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) => list(i + 2)),
  );

  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    ...[first, ...rest].flatMap(({ data }) =>
      data.map((product) => ({
        url: `${siteUrl}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ),
  ];
}
