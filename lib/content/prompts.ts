import type { Product } from '@/lib/products';
import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'fact-bound-expert-review-extraction-v3';
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
      'Step 1 review requirements: cover overview, pros, cons, features, pricing, use cases, FAQs, and verdict in connected expert prose; include product-specific context; avoid generic filler; keep every claim grounded in the supplied facts.',
      'Step 2: Extract Overview, Pros, Cons, Features, Pricing, Use Cases, FAQs, and Verdict from that internal review into the expected JSON fields for storage.',
      'Map Features to review.featureHighlights, Pricing to review.pricingSummary, FAQs to review.faq, and Verdict to review.verdict.',
      'Overview must summarize what the product is, who it serves, primary strengths, and primary use cases without copied wording.',
      'Features and use cases must be derived from actual product features and useCases; generate 5-10 workflows when enough facts exist.',
      'Pros must come from supplied strengths, reviews, ratings, or feature facts; cons must be realistic tradeoffs from supplied cons, notFor, or missing capabilities.',
      'Pricing must mention free plans, paid plans, and enterprise availability only when supplied in pricing or pricingPlans.',
      'FAQ questions must be product-specific and should not be identical across products.',
      'Set quality.overall to 95+ only when the draft is factually grounded, specific, unique, SEO complete, product relevant, and free of unsupported claims.',
      'Subtract quality points for generic wording, hallucinated features, copied sections, repeated FAQs, repeated pros/cons, and unsupported claims.',
      'List any missing or unsupported source needs in missingContent instead of guessing.',
    ].join(' '),
    expectedJson: { review: { overview: ['string'], pros: ['string'], cons: ['string'], whoShouldBuy: ['string'], whoShouldAvoid: ['string'], pricingSummary: 'string', featureHighlights: ['string'], verdict: 'string', faq: [{ question: 'string', answer: 'string' }] }, buyingGuide: [{ category: 'string', whyMadeTheList: 'string', bestUseCase: 'string', whoShouldSkip: 'string', topCompetitor: 'string', quickSummary: 'string' }], alternatives: [{ slug: 'string', name: 'string', bestFor: 'string', biggestStrength: 'string', biggestWeakness: 'string', whySomeoneWouldSwitch: 'string' }], comparison: [{ competitorSlug: 'string', competitorName: 'string', mainDifference: 'string', whenProductWins: 'string', whenCompetitorWins: 'string', recommendation: 'string' }], tutorial: { title: 'string', steps: ['string'], summary: 'string' }, seo: { title: 'string', metaDescription: 'string', openGraphDescription: 'string', twitterDescription: 'string', searchSnippet: 'string', shortSummary: 'string', longSummary: 'string', scores: { uniqueness: 0, keywordCoverage: 0, contentCompleteness: 0 } }, quality: { specificity: 0, readability: 0, productRelevance: 0, seoCoverage: 0, contentDepth: 0, internalLinking: 0, factualAccuracy: 0, uniqueness: 0, unsupportedClaims: 0, overall: 0, recommendations: ['string'] }, missingContent: { missing: ['string'], recommendations: ['string'] } },
    factPack: input,
    promptVersion: PROMPT_VERSION,
  };
}

export function sectionPrompt(product: Product, section: ReviewSectionKey) { const spec = REVIEW_SECTIONS.find((item) => item.key === section); if (!spec) throw new Error(`Unknown section: ${section}`); return { instructions: [`Generate only the ${spec.title} section from an internal natural expert review pass.`, ...FACT_BOUND_RULES, 'First draft the relevant review passage naturally as scratch work, without JSON or templates, then extract only the requested section into the expected JSON shape.', 'Keep it publication-ready and fact-bound.', 'If the provided fields are insufficient, return the closest supported content rather than guessing.'].join(' '), expectedJson: expectedShape(section), productJson: JSON.stringify(pick(product, spec.sourceFields), null, 2) }; }
function expectedShape(section: ReviewSectionKey) { if (section === 'faq') return '{ "content": [{ "question": "...", "answer": "..." }] }'; if (['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(section)) return '{ "content": ["..."] }'; return '{ "content": "..." }'; }
function pick(product: Product, fields: string[]) { return Object.fromEntries(fields.map((field) => [field, (product as unknown as Record<string, unknown>)[field]])); }
