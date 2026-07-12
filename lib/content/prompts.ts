import type { Product } from '@/lib/products';
import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'fact-bound-product-reviews-v2';
export const PROVIDER_VERSION = 'openai-responses-json-v1';
export const REVIEW_SECTIONS: { key: ReviewSectionKey; title: string; sourceFields: string[] }[] = [
  { key: 'overview', title: 'Overview', sourceFields: ['name', 'tagline', 'description', 'features', 'categories', 'platforms', 'bestFor', 'useCases'] },
  { key: 'pros', title: 'Pros', sourceFields: ['pros', 'features', 'rating', 'strengths'] },
  { key: 'cons', title: 'Cons', sourceFields: ['cons', 'notFor', 'weaknesses'] },
  { key: 'pricingSummary', title: 'Pricing Summary', sourceFields: ['pricing', 'pricingPlans'] },
  { key: 'whoShouldBuy', title: 'Who Should Buy', sourceFields: ['audiences', 'bestFor', 'idealUsers', 'useCases'] },
  { key: 'whoShouldAvoid', title: 'Who Should Avoid', sourceFields: ['notFor', 'cons', 'weaknesses'] },
  { key: 'useCases', title: 'Use Cases', sourceFields: ['useCases', 'features', 'bestFor'] },
  { key: 'faq', title: 'FAQ', sourceFields: ['faq', 'pricing', 'pricingPlans', 'features', 'platforms', 'bestFor', 'cons'] },
  { key: 'verdict', title: 'Final Verdict', sourceFields: ['rating', 'review', 'pros', 'cons', 'bestFor', 'pricing', 'pricingPlans'] },
];

const FACT_BOUND_RULES = [
  'Generate each review section independently from the supplied structured product facts.',
  'Only describe capabilities, plans, integrations, audiences, alternatives, and limitations that are present in productJson or factPack.',
  'If a capability or price is not supplied, do not invent a substitute; omit it or explicitly say the supplied facts do not confirm it.',
  'Do not borrow features from other products. For example, Brand Kits, Conversion Scores, Product Visuals, and Creative Exports must not appear unless the current product facts include them.',
  'Use product-specific examples and avoid reusable boilerplate such as "human review recommended" unless that exact limitation is supported by the facts.',
  'Pricing must use only provided plan names and prices. Never create Starter, Professional, Agency, or Enterprise plans unless those exact plans are supplied.',
  'Alternatives must stay in the same or adjacent product category and come from the supplied alternatives/comparisons lists.',
  'FAQs, pros, cons, use cases, and verdicts must be specific to this product and should not repeat wording used for a different tool.',
];

export function systemPrompt() {
  return [
    'You are an experienced software review editor building fact-bound affiliate review assets.',
    ...FACT_BOUND_RULES,
    'Before returning JSON, self-audit every claim against the supplied facts and remove unsupported claims.',
    'Do not mention AI assistance, content generation, prompts, or internal workflow.',
    'Return strict JSON matching the requested shape.',
  ].join('\n');
}

export function fullReviewPrompt(input: unknown) {
  return {
    instructions: [
      'Generate every content asset in one response using only the supplied factPack.',
      ...FACT_BOUND_RULES,
      'Overview must summarize what the product is, who it serves, primary strengths, and primary use cases without copied wording.',
      'Feature highlights/use cases must be derived from actual product features and useCases; generate 5-10 workflows when enough facts exist.',
      'Pros must come from supplied strengths, reviews, ratings, or feature facts; cons must be realistic tradeoffs from supplied cons, notFor, or missing capabilities.',
      'Pricing must mention free plans, paid plans, and enterprise availability only when supplied in pricing or pricingPlans.',
      'FAQ questions must be product-specific and should not be identical across products.',
      'Set quality.overall to 95+ only when the draft is factually grounded, specific, unique, SEO complete, product relevant, and free of unsupported claims.',
      'Subtract quality points for generic wording, hallucinated features, copied sections, repeated FAQs, repeated pros/cons, and unsupported claims.',
      'List any missing or unsupported source needs in missingContent instead of guessing.',
    ].join(' '),
    expectedJson: { review: { overview: ['string'], pros: ['string'], cons: ['string'], whoShouldBuy: ['string'], whoShouldAvoid: ['string'], pricingSummary: 'string', featureHighlights: ['string'], verdict: 'string', faq: [{ question: 'string', answer: 'string' }] }, buyingGuide: [{ category: 'string', whyMadeTheList: 'string', bestUseCase: 'string', whoShouldSkip: 'string', topCompetitor: 'string', quickSummary: 'string' }], alternatives: [{ slug: 'string', name: 'string', bestFor: 'string', biggestStrength: 'string', biggestWeakness: 'string', whySomeoneWouldSwitch: 'string' }], comparison: [{ competitorSlug: 'string', competitorName: 'string', mainDifference: 'string', whenProductWins: 'string', whenCompetitorWins: 'string', recommendation: 'string' }], tutorial: { title: 'string', steps: ['string'], summary: 'string' }, seo: { title: 'string', metaDescription: 'string', openGraphDescription: 'string', twitterDescription: 'string', searchSnippet: 'string', shortSummary: 'string', longSummary: 'string', scores: { uniqueness: 0, keywordCoverage: 0, contentCompleteness: 0 } }, quality: { specificity: 0, readability: 0, productRelevance: 0, seoCoverage: 0, contentDepth: 0, internalLinking: 0, factualAccuracy: 0, uniqueness: 0, unsupportedClaims: 0, recommendations: ['string'] }, missingContent: { missing: ['string'], recommendations: ['string'] } },
    factPack: input,
    promptVersion: PROMPT_VERSION,
  };
}

export function sectionPrompt(product: Product, section: ReviewSectionKey) { const spec = REVIEW_SECTIONS.find((item) => item.key === section); if (!spec) throw new Error(`Unknown section: ${section}`); return { instructions: [`Generate only the ${spec.title} section.`, ...FACT_BOUND_RULES, 'Keep it publication-ready and fact-bound.', 'If the provided fields are insufficient, return the closest supported content rather than guessing.'].join(' '), expectedJson: expectedShape(section), productJson: JSON.stringify(pick(product, spec.sourceFields), null, 2) }; }
function expectedShape(section: ReviewSectionKey) { if (section === 'faq') return '{ "content": [{ "question": "...", "answer": "..." }] }'; if (['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(section)) return '{ "content": ["..."] }'; return '{ "content": "..." }'; }
function pick(product: Product, fields: string[]) { return Object.fromEntries(fields.map((field) => [field, (product as unknown as Record<string, unknown>)[field]])); }
