import type { MetadataRoute } from 'next';
import { CATEGORIES, getCategoryHref, getProducts } from '@/lib/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const products = await getProducts();
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    ...CATEGORIES.map((category) => ({ url: `${siteUrl}${getCategoryHref(category)}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((product) => ({
      url: product.canonicalUrl ?? `${siteUrl}/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
