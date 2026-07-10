import type { Product } from '@/lib/products';
import { getProduct, getProducts } from '@/lib/products';
import { REVIEW_SECTIONS, sectionPrompt, systemPrompt } from './prompts';
import { getAiProvider } from './providers';
import { readReviewDraft, writeReviewDraft } from './storage';
import type { GeneratedSection, ReviewDraft, ReviewSectionKey } from './types';

type Options = { force?: boolean; section?: ReviewSectionKey };
export async function generateReview(slug: string, options: Options = {}) {
  const product = await getProduct(slug); if (!product) throw new Error(`Unknown product: ${slug}`);
  const existing = await readReviewDraft(slug, 'drafts');
  if (existing && !options.force && !options.section) return existing;
  const provider = getAiProvider(); const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'; const now = new Date().toISOString();
  const draft: ReviewDraft = existing ?? baseDraft(product, model, now);
  const sections = REVIEW_SECTIONS.filter((item) => !options.section || item.key === options.section);
  for (const section of sections) {
    if (!options.force && draft.sections[section.key] && !options.section) continue;
    const result = await provider.generateJson<{ content: GeneratedSection['content'] }>({ system: systemPrompt(), prompt: sectionPrompt(product, section.key), model });
    draft.sections[section.key] = { key: section.key, title: section.title, content: result.content, generatedAt: new Date().toISOString(), model, sourceFields: section.sourceFields };
  }
  draft.updatedAt = new Date().toISOString(); draft.status = 'needs_review'; await writeReviewDraft(draft); return draft;
}
export async function generateAllReviews(options: Options = {}) { const products = await getProducts(); for (const product of products) await generateReview(product.slug, options); }
function baseDraft(product: Product, model: string, now: string): ReviewDraft { return { type: 'review', slug: product.slug, productSlug: product.slug, status: 'draft', generatedAt: now, updatedAt: now, model, seo: { title: product.seoTitle ?? `${product.name} Review: ${product.tagline}`, metaDescription: product.metaDescription ?? product.description, canonical: product.canonicalUrl ?? `/${product.slug}` }, sections: {} as ReviewDraft['sections'], productSnapshot: { slug: product.slug, name: product.name, rating: product.rating, pricing: product.pricing, categories: product.categories, platforms: product.platforms, affiliateLink: product.affiliateLink, logo: product.logo, features: product.features } }; }
