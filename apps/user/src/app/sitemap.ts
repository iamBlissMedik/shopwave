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
  const entries: MetadataRoute.Sitemap = [{ url: siteUrl, changeFrequency: 'daily', priority: 1 }];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, meta } = await api.products.list({ page, limit: PAGE_SIZE });
    for (const product of data) {
      entries.push({
        url: `${siteUrl}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    if (!meta.hasNextPage) break;
  }
  return entries;
}
