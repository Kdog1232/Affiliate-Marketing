import type { Product } from '@/lib/products';
import type { GeneratedContentAssets, MissingContentReport, QualityScore, ReviewDraft } from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const TEMPLATE_BLEED_TERMS = ['Brand Kits', 'Conversion Scores', 'Conversion Scoring', 'Product Visuals', 'Creative Exports', 'Creative Variants', 'Ad Creative Generation'];
const GENERIC_PHRASES = ['human review recommended', 'compare on pricing, core features, ease of use', 'for the right audience', 'practical fit check'];

export function detectMissingContent(product: Product, assets?: GeneratedContentAssets): MissingContentReport {
  const missing: string[] = [];
  if (!product.screenshots?.length && !product.heroImage) missing.push('Missing screenshots');
  if (!product.platforms?.length) missing.push('Missing platforms or integrations');
  if (!product.pricing || !product.pricingPlans?.length) missing.push('Missing pricing');
  if (!product.alternatives?.length && !assets?.alternatives?.length) missing.push('No alternatives');
  if (!product.comparison?.length && !assets?.comparison?.length) missing.push('No comparisons');
  if (!product.faq?.length || product.faq.length < 3) missing.push('Weak FAQ');
  if (!product.seoTitle || !product.metaDescription) missing.push('Missing SEO metadata');
  return { missing, recommendations: missing.map((item) => `Add or generate ${item.toLowerCase()} before publishing.`) };
}

export function analyzeReviewQuality(product: Product, draft: Pick<ReviewDraft, 'sections' | 'seo' | 'assets'>): QualityScore {
  const text = Object.values(draft.sections ?? {}).flatMap((section) => Array.isArray(section.content) ? section.content.map((item) => typeof item === 'string' ? item : `${item.question} ${item.answer}`) : section.content).join(' ');
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const featureTerms = product.features.map((f) => f.title);
  const planTerms = (product.pricingPlans ?? []).map((plan) => plan.name);
  const productTerms = [product.name, product.primaryCategory, product.bestFor, product.pricing, ...(product.categories ?? []), ...featureTerms, ...planTerms].filter(Boolean).map(String);
  const matchedTerms = productTerms.filter((term) => lowerText.includes(term.toLowerCase())).length;
  const specificity = clamp((matchedTerms / Math.max(productTerms.length, 1)) * 100);
  const readability = clamp(100 - Math.max(0, (words.length / Math.max(text.split(/[.!?]/).filter(Boolean).length, 1)) - 24) * 3);
  const productRelevance = clamp((text.match(new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'))?.length ?? 0) * 15 + specificity * 0.5);
  const seoCoverage = clamp((draft.seo?.title ? 25 : 0) + (draft.seo?.metaDescription ? 25 : 0) + (draft.seo?.shortSummary ? 20 : 0) + (draft.seo?.scores?.keywordCoverage ?? 0) * 0.3);
  const contentDepth = clamp(words.length / 8 + Object.keys(draft.sections ?? {}).length * 5);
  const internalLinking = clamp(((draft.assets?.alternatives?.length ?? 0) + (draft.assets?.comparison?.length ?? 0) + (draft.assets?.buyingGuide?.length ?? 0)) * 15);
  const supportedTerms = new Set([...featureTerms, ...planTerms].map((term) => term.toLowerCase()));
  const unsupportedTemplateTerms = TEMPLATE_BLEED_TERMS.filter((term) => lowerText.includes(term.toLowerCase()) && !supportedTerms.has(term.toLowerCase()));
  const genericHits = GENERIC_PHRASES.filter((phrase) => lowerText.includes(phrase));
  const unsupportedClaims = unsupportedTemplateTerms.length;
  const factualAccuracy = clamp(100 - unsupportedClaims * 25);
  const uniqueness = clamp(100 - genericHits.length * 15);
  const overall = clamp((specificity + readability + productRelevance + seoCoverage + contentDepth + internalLinking + factualAccuracy + uniqueness) / 8 - unsupportedClaims * 5);
  const recommendations = [
    ...(overall < 95 ? ['Increase product-specific examples, comparison context, SEO summaries, and fact-backed detail until the review clears 95/100.'] : []),
    ...unsupportedTemplateTerms.map((term) => `Remove unsupported template claim: ${term}.`),
    ...genericHits.map((phrase) => `Replace generic wording: ${phrase}.`),
  ];
  return { specificity, readability, productRelevance, seoCoverage, contentDepth, internalLinking, factualAccuracy, uniqueness, unsupportedClaims, overall, recommendations };
}
