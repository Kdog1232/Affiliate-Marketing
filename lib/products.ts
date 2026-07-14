import { promises as fs } from 'fs';
import path from 'path';


export type KnowledgeGraphFeature = {
  name: string;
  whatItDoes: string;
  whyItMatters: string;
  bestFor?: string[];
  example?: string;
  evidence?: string;
  tradeoff?: string;
  recommendedWorkflow?: string;
};

export type KnowledgeGraphPro = {
  title: string;
  evidence: string;
  whoBenefits?: string[];
  tradeoff?: string;
};

export type KnowledgeGraphCon = {
  title: string;
  evidence: string;
  whoIsAffected?: string[];
  mitigation?: string;
};

export type KnowledgeGraphPricingPlan = {
  plan: string;
  price?: string;
  bestFor: string;
  upgradeReason?: string;
  skipIf?: string;
  evidence?: string;
};

export type KnowledgeGraphAlternative = {
  product: string;
  slug?: string;
  betterAt?: string[];
  worseAt?: string[];
  whenToChoose: string;
};

export type KnowledgeGraphUseCase = {
  title: string;
  workflow: string;
  industry?: string;
  timeSaved?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
};

export type ReviewerIntelligence = {
  biggestPurchaseReason?: string;
  biggestDisappointment?: string;
  competitiveAdvantage?: string;
  biggestWeakness?: string;
  learningCurve?: string;
  roi?: string;
  bestIndustry?: string;
  mostUnderratedFeature?: string;
  overhypedFeature?: string;
  editorialAngle?: string;
};

export type ProductKnowledgeGraph = {
  version: 2;
  facts: {
    features?: KnowledgeGraphFeature[];
    pros?: KnowledgeGraphPro[];
    cons?: KnowledgeGraphCon[];
    pricing?: KnowledgeGraphPricingPlan[];
    alternatives?: KnowledgeGraphAlternative[];
    useCases?: KnowledgeGraphUseCase[];
  };
  interpretation?: ReviewerIntelligence;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category?: string;
  summary?: string;
  logo: string;
  heroImage: string;
  heroImageAlt?: string;
  screenshotAliases?: string[];
  screenshots?: string[];
  gallery?: boolean;
  imageDisplayMode?: 'gallery' | 'hero';
  affiliateLink: string;
  rating: number;
  reviewCount: number;
  categories?: string[];
  primaryCategory?: string;
  secondaryCategories?: string[];
  tags?: string[];
  setupTime: string;
  bestFor: string | string[];
  idealUsers?: string[];
  strengths?: string[];
  weaknesses?: string[];
  keyFeatures?: { title: string; description: string; whatItDoes?: string; whyItMatters?: string; example?: string; whoBenefits?: string | string[]; tradeoff?: string; recommendedWorkflow?: string }[];
  reviewerIntelligence?: Record<string, string>;
  workflows?: { title: string; description: string; whoUses?: string; whyItSavesTime?: string; outcome?: string }[];
  pricingRecommendations?: string[];
  buyerGuidance?: string[];
  pricingTradeoffs?: string[];
  examples?: string[];
  commonMistakes?: string[];
  hiddenStrengths?: string[];
  bestFirstTask?: string;
  ratings?: { easeOfUse: number; features: number; value: number; support: number; integrations: number; aiQuality: number };
  bestForCards?: { title: string; description: string }[];
  users: string;
  platforms: string[];
  pricing: string | { summary: string; freePlan?: string; startingPrice?: string; billing?: string; notes?: string[] };
  categoryBadge?: string;
  seoTitle?: string;
  seoKeywords?: string[];
  keywords?: string[];
  metaDescription?: string;
  quickFacts?: { label: string; value: string }[];
  overview?: string[];
  useCases?: string[];
  alternatives?: { name: string; slug?: string; logo?: string; description: string }[];
  comparisonMatrix?: { columns: string[]; rows: { feature: string; values: string[] }[] };
  canonicalUrl?: string;
  features: { icon: string; title: string; description: string; whatItDoes?: string; whyItMatters?: string; example?: string; whoBenefits?: string | string[]; tradeoff?: string; recommendedWorkflow?: string }[];
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
  knowledgeGraph?: ProductKnowledgeGraph;
};

const productsDirectory = path.join(process.cwd(), 'products');
const screenshotsDirectory = path.join(process.cwd(), 'public', 'screenshots');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg']);

export async function getProductSlugs() {
  const files = await fs.readdir(productsDirectory);
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, ''));
}

function normalizeImageToken(value: string) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function discoverHeroImage(product: Product) {
  const terms = Array.from(new Set([
    product.slug,
    product.name,
    ...(product.screenshotAliases ?? []),
  ].map(normalizeImageToken).filter(Boolean)));

  try {
    const files = await fs.readdir(screenshotsDirectory);
    const candidates = files
      .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
      .map((file) => ({ file, extension: path.extname(file).toLowerCase(), token: normalizeImageToken(path.basename(file, path.extname(file))) }))
      .filter(({ token }) => token.includes('hero') && terms.some((term) => token === `${term}-hero` || token === `${term}-homepage-hero` || token === `${term}-home-hero` || token === `${term}-dashboard-hero` || token === `${term}-hero-screenshot` || token === `${term}-screenshot-hero` || token.startsWith(`${term}-hero`) || token.endsWith(`${term}-hero`)));

    candidates.sort((a, b) => Number(a.extension === '.svg') - Number(b.extension === '.svg') || a.token.length - b.token.length || a.file.localeCompare(b.file));
    return candidates[0] ? `/screenshots/${candidates[0].file}` : product.heroImage;
  } catch {
    return product.heroImage;
  }
}

async function applyDiscoveredImages(product: Product) {
  const heroImage = await discoverHeroImage(product);
  const screenshots = product.screenshots ?? [];
  return {
    ...product,
    heroImage,
    screenshots: screenshots.includes(heroImage) ? screenshots : [heroImage, ...screenshots],
  };
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const file = await fs.readFile(path.join(productsDirectory, `${slug}.json`), 'utf8');
    const product = await applyDiscoveredImages(JSON.parse(file) as Product);
    const publishedFile = path.join(process.cwd(), 'content', 'published', 'reviews', `${slug}.json`);
    try {
      const { applyPublishedReview } = await import('./published-content');
      const published = JSON.parse(await fs.readFile(publishedFile, 'utf8'));
      return applyPublishedReview(product, published);
    } catch {
      return product;
    }
  } catch {
    return null;
  }
}

export async function getProducts() {
  const slugs = await getProductSlugs();
  return Promise.all(slugs.map(async (slug) => getProduct(slug))).then((items) => items.filter(Boolean) as Product[]);
}

export type Category = {
  slug: string;
  name: string;
  pathSlug?: string;
  intent?: string;
};

export const CATEGORIES: readonly Category[] = [
  { slug: 'assistant', name: 'AI Assistants' },
  { slug: 'writing', name: 'AI Writing', pathSlug: 'ai-writing', intent: 'drafting, editing, brainstorming, and publishing content faster' },
  { slug: 'coding', name: 'AI Coding', pathSlug: 'ai-coding', intent: 'shipping software, debugging, and developer productivity' },
  { slug: 'research', name: 'AI Research', intent: 'summarizing sources, exploring questions, and speeding up analysis' },
  { slug: 'education', name: 'Education' },
  { slug: 'business', name: 'Business' },
  { slug: 'marketing', name: 'Marketing', intent: 'campaign planning, creative production, and growth workflows' },
  { slug: 'development', name: 'Development' },
  { slug: 'productivity', name: 'Productivity', intent: 'saving time, automating busywork, and organizing knowledge' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'design', name: 'Design', intent: 'creating polished visuals, brand assets, and production-ready creative' },
  { slug: 'creator-tools', name: 'Creator Tools' },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getCategoryPathSlug(category: Category) {
  return category.pathSlug ?? category.slug;
}

export function getCategoryHref(category: Category) {
  return `/categories/${getCategoryPathSlug(category)}`;
}

export function getCategoryByPathSlug(pathSlug: string) {
  return CATEGORIES.find((category) => getCategoryPathSlug(category) === pathSlug || category.slug === pathSlug) ?? null;
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

export function sortProducts(products: Product[], sort = 'rating') {
  return [...products].sort((a, b) => {
    if (sort === 'reviews') return b.reviewCount - a.reviewCount || b.rating - a.rating || a.name.localeCompare(b.name);
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'newest') return Date.parse(b.review.datePublished) - Date.parse(a.review.datePublished) || a.name.localeCompare(b.name);
    return b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
  });
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
