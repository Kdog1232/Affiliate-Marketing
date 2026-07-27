import type { MetadataRoute } from 'next';
import { CATEGORIES, getCategoryHref, getProductHref, getProducts } from '@/lib/products';
import { getComparisonPairs } from '@/lib/comparisons';
import { EDUCATION_GUIDES, guideSlug } from '@/lib/education';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aitoolbet.com';
  const products = await getProducts();
  const comparisons = getComparisonPairs(products);
  return [
    { url: `${siteUrl}/education-ai`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.95 },
    ...EDUCATION_GUIDES.map((guide) => ({ url: `${siteUrl}/education-ai/guides/${guideSlug(guide)}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    ...CATEGORIES.map((category) => ({ url: `${siteUrl}${getCategoryHref(category)}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((product) => ({
      url: `${siteUrl}${getProductHref(product)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...comparisons.map((comparison) => ({
      url: `${siteUrl}/compare/${comparison.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
