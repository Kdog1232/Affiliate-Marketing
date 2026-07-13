import { getProducts, getRelatedProducts, type Product, type ProductKnowledgeGraph } from '@/lib/products';
import { getComparisonSlug, getRelatedComparisonProducts } from '@/lib/comparisons';

export type NormalizedProductKnowledgeGraph = ProductKnowledgeGraph & {
  completeness: {
    explicitV2: boolean;
    featureDetailCount: number;
    pricingDetailCount: number;
    useCaseDetailCount: number;
    hasReviewerIntelligence: boolean;
  };
};

export async function buildProductFactPack(product: Product) {
  const products = await getProducts();
  const alternatives = (product.alternatives ?? getRelatedProducts(product, products, 5).map((item) => ({ name: item.name, slug: item.slug, logo: item.logo, description: item.description })));
  const comparisonProducts = getRelatedComparisonProducts(product, products, 5);
  const knowledgeGraph = normalizeProductKnowledgeGraph(product, alternatives);

  return {
    product: {
      slug: product.slug, name: product.name, tagline: product.tagline, description: product.description, rating: product.rating, reviewCount: product.reviewCount,
      categories: product.categories, primaryCategory: product.primaryCategory, secondaryCategories: product.secondaryCategories, tags: product.tags,
      pricing: product.pricing, pricingPlans: product.pricingPlans, platforms: product.platforms, setupTime: product.setupTime, bestFor: product.bestFor, users: product.users,
      features: product.features, keyFeatures: product.keyFeatures, pros: product.pros, cons: product.cons, strengths: product.strengths, weaknesses: product.weaknesses, audiences: product.audiences, idealUsers: product.idealUsers, notFor: product.notFor, useCases: product.useCases, workflows: product.workflows ?? product.howItWorks, reviewerIntelligence: product.reviewerIntelligence, pricingRecommendations: product.pricingRecommendations, buyerGuidance: product.buyerGuidance, pricingTradeoffs: product.pricingTradeoffs, examples: product.examples, commonMistakes: product.commonMistakes, hiddenStrengths: product.hiddenStrengths, bestFirstTask: product.bestFirstTask, faq: product.faq,
      screenshots: product.screenshots, heroImage: product.heroImage, seoTitle: product.seoTitle, metaDescription: product.metaDescription, seoKeywords: product.seoKeywords ?? product.keywords,
      knowledgeGraph,
    },
    knowledgeGraph,
    reviewerIntelligence: knowledgeGraph.interpretation,
    alternatives,
    comparisons: comparisonProducts.map((candidate) => ({ slug: getComparisonSlug(product, candidate), competitorSlug: candidate.slug, competitorName: candidate.name, competitorCategory: candidate.primaryCategory, competitorPricing: candidate.pricing, competitorRating: candidate.rating, competitorBestFor: candidate.bestFor, competitorFeatures: candidate.features.map((feature) => feature.title) })),
    existingComparisonRows: product.comparison,
  };
}

function normalizeProductKnowledgeGraph(product: Product, alternatives: { name: string; slug?: string; description: string }[]): NormalizedProductKnowledgeGraph {
  const explicit = product.knowledgeGraph;
  const facts = explicit?.facts ?? {};
  const bestFor = asStringArray(product.bestFor);
  const fallbackFeatures = product.features.map((feature) => ({
    name: feature.title,
    whatItDoes: feature.description,
    whyItMatters: `Helps ${bestFor[0] ?? product.users} use ${product.name} for ${feature.title.toLowerCase()} instead of starting from a blank prompt.`,
    bestFor: bestFor.slice(0, 3),
  }));
  const fallbackPros = product.pros.map((title) => ({
    title,
    evidence: matchingText(title, [...(product.strengths ?? []), ...product.features.map((feature) => feature.description), product.review.summary]) ?? title,
    whoBenefits: bestFor.slice(0, 3),
  }));
  const fallbackCons = product.cons.map((title) => ({
    title,
    evidence: matchingText(title, [...(product.weaknesses ?? []), ...product.notFor.map((item) => item.description)]) ?? title,
    mitigation: 'Confirm this tradeoff against your workflow before upgrading.',
  }));
  const fallbackPricing = product.pricingPlans.map((plan) => ({
    plan: plan.name,
    price: plan.price,
    bestFor: plan.description,
    upgradeReason: plan.features[0],
    skipIf: plan.name.toLowerCase() === 'free' ? 'You already need higher usage limits or team administration.' : 'The included capabilities do not match your weekly workflow.',
  }));
  const fallbackAlternatives = alternatives.map((alternative) => ({
    product: alternative.name,
    slug: alternative.slug,
    whenToChoose: alternative.description,
  }));
  const fallbackUseCases = (product.useCases ?? []).map((useCase) => ({
    title: useCase,
    workflow: `${useCase} with ${product.name}, then review the output against your source material before publishing or acting on it.`,
    difficulty: 'Intermediate',
  }));

  const normalized: ProductKnowledgeGraph = {
    version: 2,
    facts: {
      features: facts.features?.length ? facts.features : fallbackFeatures,
      pros: facts.pros?.length ? facts.pros : fallbackPros,
      cons: facts.cons?.length ? facts.cons : fallbackCons,
      pricing: facts.pricing?.length ? facts.pricing : fallbackPricing,
      alternatives: facts.alternatives?.length ? facts.alternatives : fallbackAlternatives,
      useCases: facts.useCases?.length ? facts.useCases : fallbackUseCases,
    },
    interpretation: explicit?.interpretation ?? inferReviewerIntelligence(product),
  };

  return {
    ...normalized,
    completeness: {
      explicitV2: Boolean(explicit),
      featureDetailCount: normalized.facts.features?.length ?? 0,
      pricingDetailCount: normalized.facts.pricing?.length ?? 0,
      useCaseDetailCount: normalized.facts.useCases?.length ?? 0,
      hasReviewerIntelligence: Boolean(normalized.interpretation),
    },
  };
}

function inferReviewerIntelligence(product: Product) {
  const bestFor = asStringArray(product.bestFor);
  return {
    biggestPurchaseReason: product.strengths?.[0] ?? product.pros[0] ?? product.tagline,
    biggestDisappointment: product.weaknesses?.[0] ?? product.cons[0],
    competitiveAdvantage: product.features[0]?.description,
    biggestWeakness: product.cons[0],
    learningCurve: `${product.setupTime} setup; complexity depends on how much source context the user brings.`,
    roi: bestFor.length ? `Best ROI when used repeatedly for ${bestFor.slice(0, 2).join(' and ')}.` : undefined,
    bestIndustry: product.categories?.[0] ?? product.primaryCategory,
    mostUnderratedFeature: product.features[0]?.title,
    editorialAngle: product.review.summary,
  };
}

function asStringArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function matchingText(title: string, candidates: string[]) {
  const terms = title.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
  return candidates.find((candidate) => terms.some((term) => candidate.toLowerCase().includes(term)));
}
