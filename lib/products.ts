import { promises as fs } from 'fs';
import path from 'path';

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  heroImage: string;
  screenshots?: string[];
  affiliateLink: string;
  rating: number;
  reviewCount: number;
  categories?: string[];
  primaryCategory?: string;
  secondaryCategories?: string[];
  tags?: string[];
  setupTime: string;
  bestFor: string;
  bestForCards?: { title: string; description: string }[];
  users: string;
  platforms: string[];
  pricing: string;
  categoryBadge?: string;
  seoTitle?: string;
  seoKeywords?: string[];
  keywords?: string[];
  metaDescription?: string;
  quickFacts?: { label: string; value: string }[];
  overview?: string[];
  useCases?: string[];
  alternatives?: { name: string; slug: string; logo: string; description: string }[];
  comparisonMatrix?: { columns: string[]; rows: { feature: string; values: string[] }[] };
  canonicalUrl?: string;
  features: { icon: string; title: string; description: string }[];
  howItWorks: { title: string; description: string }[];
  pros: string[];
  cons: string[];
  pricingPlans: { name: string; price: string; description: string; features: string[]; cta: string }[];
  audiences: { title: string; description: string }[];
  testimonials: { quote: string; author: string; role: string }[];
  socialProof: { metric: string; label: string; description: string }[];
  comparison: { feature: string; product: string; competitors: string; winner: string }[];
  whyTrust: { title: string; description: string }[];
  notFor: { title: string; description: string }[];
  review: { author: string; title: string; summary: string; datePublished: string };
  verdict?: string;
  reviewScore?: string;
  reviewStatus?: 'Ready to Publish' | 'Needs Work';
  faq: { question: string; answer: string }[];
};

const productsDirectory = path.join(process.cwd(), 'products');

export async function getProductSlugs() {
  const files = await fs.readdir(productsDirectory);
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, ''));
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const file = await fs.readFile(path.join(productsDirectory, `${slug}.json`), 'utf8');
    return JSON.parse(file) as Product;
  } catch {
    return null;
  }
}

export async function getProducts() {
  const slugs = await getProductSlugs();
  return Promise.all(slugs.map(async (slug) => getProduct(slug))).then((items) => items.filter(Boolean) as Product[]);
}


export const CATEGORIES = [
  { slug: 'assistant', name: 'AI Assistants' },
  { slug: 'writing', name: 'AI Writing' },
  { slug: 'coding', name: 'AI Coding' },
  { slug: 'research', name: 'AI Research' },
  { slug: 'education', name: 'Education' },
  { slug: 'business', name: 'Business' },
  { slug: 'marketing', name: 'Marketing' },
  { slug: 'development', name: 'Development' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'design', name: 'Design' },
  { slug: 'creator-tools', name: 'Creator Tools' },
] as const;

export function getCategory(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getProductCategorySlugs(product: Product) {
  return Array.from(new Set([
    product.primaryCategory,
    ...(product.secondaryCategories ?? []),
    ...(product.categories ?? []),
  ].filter(Boolean) as string[]));
}

export async function getProductsByCategory(categorySlug: string) {
  const products = await getProducts();
  return products.filter((product) => getProductCategorySlugs(product).includes(categorySlug));
}

function getSharedCount(source: string[], candidate: string[]) {
  const candidateSet = new Set(candidate);
  return source.filter((item) => candidateSet.has(item)).length;
}

export function getRelatedProducts(product: Product, products: Product[], limit = 5) {
  const sourceCategories = getProductCategorySlugs(product);
  const sourceTags = product.tags ?? [];

  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => {
      const categoryScore = getSharedCount(sourceCategories, getProductCategorySlugs(candidate)) * 2;
      const tagScore = getSharedCount(sourceTags, candidate.tags ?? []);
      const primaryCategoryBonus = product.primaryCategory && product.primaryCategory === candidate.primaryCategory ? 4 : 0;
      return { product: candidate, score: categoryScore + tagScore + primaryCategoryBonus };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((item) => item.product);
}
