import type { Product } from '@/lib/products';
import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'kg-utilization-maximizer-v1';
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
    'Before returning the final extraction payload, self-audit every claim against the supplied facts and remove unsupported claims.',
    'Do not mention AI assistance, content generation, prompts, internal workflow, or the intermediate review drafting step.',
    'Return strict JSON matching the requested shape so the application can store the extracted sections.',
  ].join('\n');
}

export function fullReviewPrompt(input: unknown) {
  return {
    instructions: [
      'Generate the review content in two explicit steps using only the supplied factPack.',
      ...FACT_BOUND_RULES,
      'Step 1: First write an internal 2,500-word expert product review from the product facts. This draft is scratch work only: do not output it, do not format it as JSON, do not use a reusable template, and write it naturally with editorial judgment.',
      'Step 1 review requirements: cover overview, pros, cons, features, pricing, use cases, alternatives, buyer advice, FAQs, and verdict in connected expert prose; include product-specific context; avoid generic filler; keep every claim grounded in the supplied facts.',
      'Knowledge Graph Utilization: naturally incorporate every major feature, workflow, pricing recommendation, reviewer intelligence insight, alternative comparison, buyer guidance point, strength, weakness, pricing tradeoff, and example present in the factPack.',
      'Editorial Expansion: whenever a feature or knowledge graph item contains whatItDoes, whyItMatters, example, whoBenefits, or tradeoff, discuss all available fields naturally; never mention only the feature name.',
      'Why This Matters: for every feature, explain why the reader should care, who benefits, and the practical outcome rather than simply summarizing the feature list.',
      'Reviewer Intelligence: every supplied insight such as Biggest Strength, Most Overrated Feature, Most Underrated Feature, Best Industry, Typical ROI, Learning Curve, Switching Cost, Best Upgrade Path, Ideal Buyer, and Not Ideal Buyer must appear naturally somewhere in the review, even if there is no dedicated page section.',
      'Workflow Expansion: if a workflow exists, describe it, show who uses it, explain why it saves time, and mention the outcome; do not reduce workflows to one sentence.',
      'Buying Advice: answer buying questions throughout the article: should I buy it, who gets the most value, who should avoid it, when should I upgrade, and when should I choose a competitor.',
      'Experience-Based Insights: include supplied commonMistakes, hiddenStrengths, and bestFirstTask naturally so the review feels based on practical product understanding.',
      'Step 2: Extract Overview, Pros, Cons, Features, Pricing, Use Cases, FAQs, and Verdict from that internal review into the expected JSON fields for storage.',
      'Map Features to review.featureHighlights, Pricing to review.pricingSummary, FAQs to review.faq, and Verdict to review.verdict.',
      'Overview must summarize what the product is, who it serves, primary strengths, and primary use cases without copied wording.',
      'Features and use cases must be derived from actual product features and useCases; generate 5-10 workflows when enough facts exist.',
      'Pros must come from supplied strengths, reviews, ratings, or feature facts; cons must be realistic tradeoffs from supplied cons, notFor, or missing capabilities.',
      'Pricing must mention free plans, paid plans, and enterprise availability only when supplied in pricing or pricingPlans.',
      'FAQ questions must be product-specific and should not be identical across products.',
      'Set quality.overall to 95+ only when the draft is factually grounded, specific, unique, SEO complete, product relevant, and free of unsupported claims.',
      'Subtract quality points for generic wording, hallucinated features, copied sections, repeated FAQs, repeated pros/cons, and unsupported claims.',
      'Produce a utilizationReport that counts used / total facts for Features, Pros, Cons, Reviewer Intelligence, Workflows, Alternatives, Pricing Guidance, Buyer Advice, Strengths, Weaknesses, Pricing Tradeoffs, and Examples.',
      'If utilizationReport.overallCoverage would be below 90, revise the internal review before extraction until it reaches at least 90 without forcing awkward prose or inventing facts.',
      'List any missing or unsupported source needs in missingContent instead of guessing.',
    ].join(' '),
    expectedJson: { review: { overview: ['string'], pros: ['string'], cons: ['string'], whoShouldBuy: ['string'], whoShouldAvoid: ['string'], pricingSummary: 'string', featureHighlights: ['string'], verdict: 'string', faq: [{ question: 'string', answer: 'string' }] }, buyingGuide: [{ category: 'string', whyMadeTheList: 'string', bestUseCase: 'string', whoShouldSkip: 'string', topCompetitor: 'string', quickSummary: 'string' }], alternatives: [{ slug: 'string', name: 'string', bestFor: 'string', biggestStrength: 'string', biggestWeakness: 'string', whySomeoneWouldSwitch: 'string' }], comparison: [{ competitorSlug: 'string', competitorName: 'string', mainDifference: 'string', whenProductWins: 'string', whenCompetitorWins: 'string', recommendation: 'string' }], tutorial: { title: 'string', steps: ['string'], summary: 'string' }, seo: { title: 'string', metaDescription: 'string', openGraphDescription: 'string', twitterDescription: 'string', searchSnippet: 'string', shortSummary: 'string', longSummary: 'string', scores: { uniqueness: 0, keywordCoverage: 0, contentCompleteness: 0 } }, quality: { specificity: 0, readability: 0, productRelevance: 0, seoCoverage: 0, contentDepth: 0, internalLinking: 0, factualAccuracy: 0, uniqueness: 0, unsupportedClaims: 0, recommendations: ['string'] }, missingContent: { missing: ['string'], recommendations: ['string'] }, utilizationReport: { features: { used: 0, total: 0, notes: ['string'] }, pros: { used: 0, total: 0, notes: ['string'] }, cons: { used: 0, total: 0, notes: ['string'] }, reviewerIntelligence: { used: 0, total: 0, notes: ['string'] }, workflows: { used: 0, total: 0, notes: ['string'] }, alternatives: { used: 0, total: 0, notes: ['string'] }, pricingGuidance: { used: 0, total: 0, notes: ['string'] }, buyerAdvice: { used: 0, total: 0, notes: ['string'] }, strengths: { used: 0, total: 0, notes: ['string'] }, weaknesses: { used: 0, total: 0, notes: ['string'] }, pricingTradeoffs: { used: 0, total: 0, notes: ['string'] }, examples: { used: 0, total: 0, notes: ['string'] }, overallCoverage: 0, omittedItems: ['string'], regenerationRecommended: false } },
    factPack: input,
    promptVersion: PROMPT_VERSION,
  };
}

export function sectionPrompt(product: Product, section: ReviewSectionKey) { const spec = REVIEW_SECTIONS.find((item) => item.key === section); if (!spec) throw new Error(`Unknown section: ${section}`); return { instructions: [`Generate only the ${spec.title} section from an internal natural expert review pass.`, ...FACT_BOUND_RULES, 'First draft the relevant review passage naturally as scratch work, without JSON or templates, then extract only the requested section into the expected JSON shape.', 'Keep it publication-ready and fact-bound.', 'If the provided fields are insufficient, return the closest supported content rather than guessing.'].join(' '), expectedJson: expectedShape(section), productJson: JSON.stringify(pick(product, spec.sourceFields), null, 2) }; }
function expectedShape(section: ReviewSectionKey) { if (section === 'faq') return '{ "content": [{ "question": "...", "answer": "..." }] }'; if (['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(section)) return '{ "content": ["..."] }'; return '{ "content": "..." }'; }
function pick(product: Product, fields: string[]) { return Object.fromEntries(fields.map((field) => [field, (product as unknown as Record<string, unknown>)[field]])); }
