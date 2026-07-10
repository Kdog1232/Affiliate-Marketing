import type { Product } from './products';
import type { ReviewDraft } from './content/types';

export function applyPublishedReview(product: Product, content: ReviewDraft): Product {
  return {
    ...product,
    overview: stringArray(content.sections.overview?.content) ?? product.overview,
    pros: stringArray(content.sections.pros?.content) ?? product.pros,
    cons: stringArray(content.sections.cons?.content) ?? product.cons,
    audiences: cardArray(content.sections.whoShouldBuy?.content) ?? product.audiences,
    notFor: cardArray(content.sections.whoShouldAvoid?.content) ?? product.notFor,
    useCases: stringArray(content.sections.useCases?.content) ?? product.useCases,
    faq: faqArray(content.sections.faq?.content) ?? product.faq,
    verdict: typeof content.sections.verdict?.content === 'string' ? content.sections.verdict.content : product.verdict,
    review: { ...product.review, summary: typeof content.sections.verdict?.content === 'string' ? content.sections.verdict.content : product.review.summary },
  };
}
function stringArray(value: unknown) { return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null; }
function faqArray(value: unknown) { return Array.isArray(value) && value.every((item) => item && typeof item.question === 'string' && typeof item.answer === 'string') ? value as Product['faq'] : null; }
function cardArray(value: unknown) { const items = stringArray(value); return items?.map((item) => ({ title: item.split(':')[0].slice(0, 48), description: item.includes(':') ? item.split(':').slice(1).join(':').trim() : item })); }
