import { getProducts, getRelatedProducts, type Product } from '@/lib/products';
import { getComparisonSlug, getRelatedComparisonProducts } from '@/lib/comparisons';

export async function buildProductFactPack(product: Product) {
  const products = await getProducts();
  const alternatives = (product.alternatives ?? getRelatedProducts(product, products, 5).map((item) => ({ name: item.name, slug: item.slug, logo: item.logo, description: item.description })));
  const comparisonProducts = getRelatedComparisonProducts(product, products, 5);
  return {
    product: {
      slug: product.slug, name: product.name, tagline: product.tagline, description: product.description, rating: product.rating, reviewCount: product.reviewCount,
      categories: product.categories, primaryCategory: product.primaryCategory, secondaryCategories: product.secondaryCategories, tags: product.tags,
      pricing: product.pricing, pricingPlans: product.pricingPlans, platforms: product.platforms, setupTime: product.setupTime, bestFor: product.bestFor, users: product.users,
      features: product.features, pros: product.pros, cons: product.cons, audiences: product.audiences, notFor: product.notFor, useCases: product.useCases, faq: product.faq,
      screenshots: product.screenshots, heroImage: product.heroImage, seoTitle: product.seoTitle, metaDescription: product.metaDescription, seoKeywords: product.seoKeywords ?? product.keywords,
    },
    alternatives,
    comparisons: comparisonProducts.map((candidate) => ({ slug: getComparisonSlug(product, candidate), competitorSlug: candidate.slug, competitorName: candidate.name, competitorCategory: candidate.primaryCategory, competitorPricing: candidate.pricing, competitorRating: candidate.rating, competitorBestFor: candidate.bestFor, competitorFeatures: candidate.features.map((feature) => feature.title) })),
    existingComparisonRows: product.comparison,
  };
}
