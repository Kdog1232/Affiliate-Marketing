import { createHash } from 'crypto';
import type { Product } from '@/lib/products';
import { getProduct, getProducts } from '@/lib/products';
import { PROMPT_VERSION, PROVIDER_VERSION, REVIEW_SECTIONS, fullReviewPrompt, sectionPrompt, systemPrompt } from './prompts';
import { getAiProvider } from './providers';
import { readReviewDraft, writeReviewDraft } from './storage';
import { buildProductFactPack } from './fact-pack';
import { analyzeReviewQuality, detectMissingContent } from './quality';
import type { AlternativeSummary, BuyingGuideSnippet, ComparisonSummary, GeneratedSection, ReviewDraft, ReviewSectionKey, SeoAsset } from './types';

type Options = { force?: boolean; section?: ReviewSectionKey };
type EngineResponse = { review: { overview: string[]; pros: string[]; cons: string[]; whoShouldBuy: string[]; whoShouldAvoid: string[]; pricingSummary: string; featureHighlights: string[]; verdict: string; faq: { question: string; answer: string }[] }; buyingGuide?: BuyingGuideSnippet[]; alternatives?: AlternativeSummary[]; comparison?: ComparisonSummary[]; tutorial?: { title: string; steps: string[]; summary: string }; seo?: Partial<SeoAsset>; quality?: ReviewDraft['quality']; missingContent?: ReviewDraft['missingContent'] };

export async function generateReview(slug: string, options: Options = {}) {
  const product = await getProduct(slug); if (!product) throw new Error(`Unknown product: ${slug}`);
  const existing = await readReviewDraft(slug, 'drafts');
  const provider = getAiProvider(); const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'; const now = new Date().toISOString();
  const factPack = await buildProductFactPack(product); const sourceHash = hashStable(factPack); const cacheHash = hashStable({ factPack, promptVersion: PROMPT_VERSION, providerVersion: PROVIDER_VERSION, model });
  if (existing && !options.force && !options.section && existing.metadata?.cacheHash === cacheHash) return { ...existing, metadata: { ...existing.metadata, cached: true } };
  const draft: ReviewDraft = existing ?? baseDraft(product, model, now);

  if (options.section) {
    const section = REVIEW_SECTIONS.find((item) => item.key === options.section)!;
    const result = await provider.generateJson<{ content: GeneratedSection['content'] }>({ system: systemPrompt(), prompt: sectionPrompt(product, section.key), model });
    draft.sections[section.key] = { key: section.key, title: section.title, content: result.content, generatedAt: new Date().toISOString(), model, sourceFields: section.sourceFields };
  } else {
    const result = await provider.generateJson<EngineResponse>({ system: systemPrompt(), prompt: fullReviewPrompt(factPack), model });
    applyEngineResponse(draft, product, result, model);
  }

  draft.assets = draft.assets ?? {};
  draft.missingContent = { ...detectMissingContent(product, draft.assets), ...(draft.missingContent ?? {}) };
  draft.quality = analyzeReviewQuality(product, draft);
  draft.metadata = { promptVersion: PROMPT_VERSION, generatedDate: new Date().toISOString(), model, provider: provider.name, providerVersion: PROVIDER_VERSION, cacheHash, sourceHash, cached: false };
  draft.updatedAt = new Date().toISOString(); draft.status = 'needs_review'; await writeReviewDraft(draft); return draft;
}
export async function generateAllReviews(options: Options = {}) { const products = await getProducts(); for (const product of products) await generateReview(product.slug, options); }
function applyEngineResponse(draft: ReviewDraft, product: Product, result: EngineResponse, model: string) { const now = new Date().toISOString(); const put = (key: ReviewSectionKey, content: GeneratedSection['content']) => { const spec = REVIEW_SECTIONS.find((item) => item.key === key)!; draft.sections[key] = { key, title: spec.title, content, generatedAt: now, model, sourceFields: spec.sourceFields }; }; put('overview', result.review.overview); put('pros', result.review.pros); put('cons', result.review.cons); put('pricingSummary', result.review.pricingSummary); put('whoShouldBuy', result.review.whoShouldBuy); put('whoShouldAvoid', result.review.whoShouldAvoid); put('useCases', result.review.featureHighlights); put('faq', result.review.faq); put('verdict', result.review.verdict); draft.seo = { title: result.seo?.title ?? product.seoTitle ?? `${product.name} Review: ${product.tagline}`, metaDescription: result.seo?.metaDescription ?? product.metaDescription ?? product.description, canonical: product.canonicalUrl ?? `/${product.slug}`, openGraphDescription: result.seo?.openGraphDescription, twitterDescription: result.seo?.twitterDescription, searchSnippet: result.seo?.searchSnippet, shortSummary: result.seo?.shortSummary, longSummary: result.seo?.longSummary, scores: result.seo?.scores }; draft.assets = { buyingGuide: result.buyingGuide, alternatives: result.alternatives, comparison: result.comparison, tutorial: result.tutorial, quality: result.quality, missingContent: result.missingContent }; draft.quality = result.quality; draft.missingContent = result.missingContent; }
function baseDraft(product: Product, model: string, now: string): ReviewDraft { return { type: 'review', slug: product.slug, productSlug: product.slug, status: 'draft', generatedAt: now, updatedAt: now, model, seo: { title: product.seoTitle ?? `${product.name} Review: ${product.tagline}`, metaDescription: product.metaDescription ?? product.description, canonical: product.canonicalUrl ?? `/${product.slug}` }, sections: {} as ReviewDraft['sections'], productSnapshot: { slug: product.slug, name: product.name, rating: product.rating, pricing: product.pricing, categories: product.categories, platforms: product.platforms, affiliateLink: product.affiliateLink, logo: product.logo, features: product.features } }; }
function hashStable(value: unknown) { return createHash('sha256').update(stableStringify(value)).digest('hex'); }
function stableStringify(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`; if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`; return JSON.stringify(value); }
