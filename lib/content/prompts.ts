import type { Product } from '@/lib/products';
import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'editorial-review-pipeline-v3';
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
  'Use only supplied structured facts. Do not invent prices, integrations, benchmarks, awards, compliance claims, platform support, or capabilities.',
  'If a capability or price is not supplied, omit it or explicitly say the supplied facts do not confirm it.',
  'Do not borrow features from other products. Product Visuals, Brand Kits, Conversion Scores, IDE agents, image generation, Projects, or any other capability may appear only when current facts support them.',
  'Pricing must use only provided plan names and prices. Never create Starter, Professional, Agency, Team, or Enterprise plans unless those exact plans are supplied.',
  'Alternatives and comparisons must come from the supplied alternatives, comparisons, or existingComparisonRows lists.',
  'Every recommendation must be grounded in the supplied pros, cons, audiences, notFor, features, use cases, pricing, or comparison data.',
];

const EDITORIAL_PIPELINE = [
  'Run this private workflow before producing the JSON. Do not expose the workflow, productUnderstanding, draftArticle, enhancement notes, validation notes, or any chain-of-thought.',
  'Stage 1 — Build a Product Understanding object from the supplied facts with primaryAudience, primaryJobs, biggestStrengths, biggestWeaknesses, differentiators, idealWorkflows, likelyAlternatives, marketFit, and situationsWhereAnotherToolWouldBeBetter.',
  'Stage 2 — Write a complete editorial review article internally before filling any JSON fields. Target 2,500-4,000 words when source facts are sufficient. Write like an experienced software reviewer at PCMag, Tom\'s Guide, TechRadar, or Wirecutter. Focus on whether the reader should spend money on the product, not SEO or page sections.',
  'Stage 3 — Improve that internal article for readability: remove repetition, combine overlapping ideas, vary sentence length, replace generic wording, add transitions, and increase specificity while keeping facts unchanged.',
  'Stage 4 — Populate the requested JSON by extracting and condensing from the enhanced article. Do not independently regenerate the overview, feature highlights, pros, cons, pricingSummary, faq, verdict, useCases, buyingGuide, alternatives, comparison, tutorial, seo, quality, or missingContent fields.',
  'Stage 5 — Validate the extracted JSON. Rewrite any field that contains generic marketing language, repeated sentence structures, unsupported claims, feature lists without explanation, identical use-case wording, empty buying guidance, or copied-sounding phrasing.',
];

const EDITORIAL_STYLE_RULES = [
  'Every major feature discussed must answer: what it does, why it matters, and who benefits most.',
  'Never merely list features. Explain what the feature changes in a real workflow and when that change matters.',
  'Use concrete workflow examples, such as a team reviewing vendor agreements, a marketer preparing campaign variants, or a founder comparing launch tools, but only when the product facts support the scenario.',
  'Add buying guidance throughout: who should buy, who should skip, when a cheaper option is enough, when a premium plan is justified, and what user gets the most value.',
  'Balance positives with tradeoffs. Praise must include context about limitations or competitors where supplied facts support that contrast.',
  'Avoid hype, filler, and marketing language. Banned phrases include: "Move from blank page to structured first draft", "Great for", "Useful for", "Powerful AI assistant", "Robust solution", "Streamline your workflow", and "Leverage AI".',
  'Vary structure and wording. Use natural, specific sentences rather than repeated openings or template-like phrasing.',
];

export function systemPrompt() {
  return [
    'You are an experienced software review editor creating publication-quality, fact-bound buying advice.',
    ...FACT_BOUND_RULES,
    ...EDITORIAL_PIPELINE,
    ...EDITORIAL_STYLE_RULES,
    'Return strict JSON matching the requested shape and nothing else.',
  ].join('\n');
}

export function fullReviewPrompt(input: unknown) {
  return {
    instructions: [
      'Generate review assets through the required editorial pipeline, then return only the final JSON.',
      ...FACT_BOUND_RULES,
      ...EDITORIAL_PIPELINE,
      ...EDITORIAL_STYLE_RULES,
      'overview should read like a concise extraction from the finished article: what the product is, why it exists, who benefits, where it fits, and the main caveats.',
      'featureHighlights must be explanatory workflow snippets, not labels. Each item should include what the capability does, why it matters, and the buyer or workflow that benefits.',
      'pros and cons must be specific tradeoffs extracted from the article, not generic adjectives.',
      'pricingSummary must explain value, plan-fit, and when a cheaper or premium option makes sense using only supplied pricing facts.',
      'faq answers must provide practical buying guidance and avoid duplicating questions across products.',
      'comparison snippets must explain when this product wins and when the named competitor wins, without ranking beyond supplied facts.',
      'Set quality.overall to 95+ only when the JSON is specific, educational, balanced, product-relevant, and free of unsupported claims. Lower it for generic wording, copied-sounding sections, feature lists, repetition, or weak buying advice.',
      'List missing facts or source needs in missingContent instead of guessing.',
    ].join(' '),
    expectedJson: { review: { overview: ['string'], pros: ['string'], cons: ['string'], whoShouldBuy: ['string'], whoShouldAvoid: ['string'], pricingSummary: 'string', featureHighlights: ['string'], verdict: 'string', faq: [{ question: 'string', answer: 'string' }] }, buyingGuide: [{ category: 'string', whyMadeTheList: 'string', bestUseCase: 'string', whoShouldSkip: 'string', topCompetitor: 'string', quickSummary: 'string' }], alternatives: [{ slug: 'string', name: 'string', bestFor: 'string', biggestStrength: 'string', biggestWeakness: 'string', whySomeoneWouldSwitch: 'string' }], comparison: [{ competitorSlug: 'string', competitorName: 'string', mainDifference: 'string', whenProductWins: 'string', whenCompetitorWins: 'string', recommendation: 'string' }], tutorial: { title: 'string', steps: ['string'], summary: 'string' }, seo: { title: 'string', metaDescription: 'string', openGraphDescription: 'string', twitterDescription: 'string', searchSnippet: 'string', shortSummary: 'string', longSummary: 'string', scores: { uniqueness: 0, keywordCoverage: 0, contentCompleteness: 0 } }, quality: { specificity: 0, readability: 0, productRelevance: 0, seoCoverage: 0, contentDepth: 0, internalLinking: 0, factualAccuracy: 0, uniqueness: 0, unsupportedClaims: 0, overall: 0, recommendations: ['string'] }, missingContent: { missing: ['string'], recommendations: ['string'] } },
    factPack: input,
    promptVersion: PROMPT_VERSION,
  };
}

export function sectionPrompt(product: Product, section: ReviewSectionKey) { const spec = REVIEW_SECTIONS.find((item) => item.key === section); if (!spec) throw new Error(`Unknown section: ${section}`); return { instructions: [`Regenerate only the ${spec.title} section by first considering how it would be extracted from a full editorial review.`, ...FACT_BOUND_RULES, ...EDITORIAL_STYLE_RULES, 'Keep it publication-ready, specific, balanced, and fact-bound.', 'If provided fields are insufficient, return the closest supported content and note missing source needs in the wording rather than guessing.'].join(' '), expectedJson: expectedShape(section), productJson: JSON.stringify(pick(product, spec.sourceFields), null, 2) }; }
function expectedShape(section: ReviewSectionKey) { if (section === 'faq') return '{ "content": [{ "question": "...", "answer": "..." }] }'; if (['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(section)) return '{ "content": ["..."] }'; return '{ "content": "..." }'; }
function pick(product: Product, fields: string[]) { return Object.fromEntries(fields.map((field) => [field, (product as unknown as Record<string, unknown>)[field]])); }
