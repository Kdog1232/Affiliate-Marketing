import { CATEGORIES, getCategory, getCategoryHref, getProductCategorySlugs, type Product } from './products';

export type ComparisonPair = { toolA: Product; toolB: Product; slug: string; score: number };

export function getComparisonSlug(toolA: Product, toolB: Product) {
  return `${toolA.slug}-vs-${toolB.slug}`;
}

export function parseComparisonSlug(slug: string) {
  const [toolA, toolB] = slug.split('-vs-');
  if (!toolA || !toolB) return null;
  return { toolA, toolB };
}

function sharedCount(a: string[], b: string[]) {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item)).length;
}

export function getComparisonCandidateScore(toolA: Product, toolB: Product) {
  const categoryScore = sharedCount(getProductCategorySlugs(toolA), getProductCategorySlugs(toolB)) * 3;
  const tagScore = sharedCount(toolA.tags ?? [], toolB.tags ?? []);
  const primaryCategoryScore = toolA.primaryCategory && toolA.primaryCategory === toolB.primaryCategory ? 6 : 0;
  return categoryScore + tagScore + primaryCategoryScore;
}

export function getComparisonPairs(products: Product[]) {
  const pairs: ComparisonPair[] = [];
  products.forEach((toolA, index) => {
    products.slice(index + 1).forEach((toolB) => {
      const score = getComparisonCandidateScore(toolA, toolB);
      if (score > 0) pairs.push({ toolA, toolB, slug: getComparisonSlug(toolA, toolB), score });
    });
  });
  return pairs.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}

export function getRelatedComparisonProducts(product: Product, products: Product[], limit = 5) {
  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => ({ product: candidate, score: getComparisonCandidateScore(product, candidate) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((item) => item.product);
}

export function findComparisonPair(products: Product[], comparisonSlug: string) {
  const parsed = parseComparisonSlug(comparisonSlug);
  if (!parsed) return null;
  const toolA = products.find((product) => product.slug === parsed.toolA);
  const toolB = products.find((product) => product.slug === parsed.toolB);
  if (!toolA || !toolB || getComparisonCandidateScore(toolA, toolB) <= 0) return null;
  return { toolA, toolB, slug: comparisonSlug, score: getComparisonCandidateScore(toolA, toolB) };
}

export function getFreePlan(product: Product) {
  return product.quickFacts?.find((fact) => fact.label.toLowerCase() === 'free plan')?.value ?? (product.pricing.toLowerCase().includes('free') ? 'Yes' : 'Check current plans');
}

export function hasFeature(product: Product, terms: string[]) {
  const haystack = [product.pricing, product.description, product.tagline, product.bestFor, ...product.features.map((feature) => `${feature.title} ${feature.description}`), ...(product.tags ?? [])].join(' ').toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

export function getScorecard(product: Product) {
  const ease = hasFeature(product, ['easy', 'beginner', 'natural', 'template']) ? 'High' : 'Moderate';
  return [
    { label: 'Overall Rating', value: `${product.rating} / 5` },
    { label: 'Ease of Use', value: ease },
    { label: 'Features', value: `${product.features.length} highlighted features` },
    { label: 'AI Quality', value: hasFeature(product, ['ai', 'llm', 'gpt', 'model', 'assistant']) ? 'Strong' : 'N/A or workflow-specific' },
    { label: 'Pricing', value: product.pricing },
    { label: 'Free Plan', value: getFreePlan(product) },
    { label: 'API', value: hasFeature(product, ['api', 'developer']) ? 'Yes / developer-friendly' : 'Not a primary focus' },
    { label: 'Integrations', value: hasFeature(product, ['integration', 'plugin', 'ecosystem', 'workflow']) ? 'Strong' : 'Check required apps' },
    { label: 'Best For', value: product.bestFor },
    { label: 'Value', value: product.rating >= 4.7 || product.pricing.toLowerCase().includes('free') ? 'Excellent' : 'Good' },
    { label: 'Support', value: product.pricingPlans.some((plan) => plan.name.toLowerCase().includes('enterprise')) ? 'Team / enterprise options' : 'Standard support' },
    { label: 'Platforms', value: product.platforms.join(', ') },
  ];
}

export function getPrimaryCategoryHref(product: Product) {
  const category = getCategory(product.primaryCategory ?? getProductCategorySlugs(product)[0] ?? CATEGORIES[0].slug);
  return category ? getCategoryHref(category) : '/categories';
}

export function getWinner(toolA: Product, toolB: Product) {
  if (toolA.rating === toolB.rating) return toolA.reviewCount >= toolB.reviewCount ? toolA : toolB;
  return toolA.rating > toolB.rating ? toolA : toolB;
}
