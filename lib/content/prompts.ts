import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'cohesive-editorial-review-v2';
export const PROVIDER_VERSION = 'openai-responses-json-v1';
export const REVIEW_SECTIONS: { key: ReviewSectionKey; title: string; sourceFields: string[] }[] = [
  { key: 'overview', title: 'Overview', sourceFields: ['name', 'tagline', 'description', 'features', 'categories', 'platforms', 'bestFor', 'useCases', 'knowledgeGraph'] },
  { key: 'pros', title: 'Pros', sourceFields: ['pros', 'features', 'rating', 'strengths', 'knowledgeGraph'] },
  { key: 'cons', title: 'Cons', sourceFields: ['cons', 'notFor', 'weaknesses', 'knowledgeGraph'] },
  { key: 'pricingSummary', title: 'Pricing Summary', sourceFields: ['pricing', 'pricingPlans', 'knowledgeGraph'] },
  { key: 'whoShouldBuy', title: 'Who Should Buy', sourceFields: ['audiences', 'bestFor', 'idealUsers', 'useCases', 'knowledgeGraph'] },
  { key: 'whoShouldAvoid', title: 'Who Should Avoid', sourceFields: ['notFor', 'cons', 'weaknesses', 'knowledgeGraph'] },
  { key: 'useCases', title: 'Use Cases', sourceFields: ['useCases', 'features', 'bestFor', 'knowledgeGraph'] },
  { key: 'faq', title: 'FAQ', sourceFields: ['faq', 'pricing', 'pricingPlans', 'features', 'platforms', 'bestFor', 'cons', 'knowledgeGraph'] },
  { key: 'verdict', title: 'Final Verdict', sourceFields: ['rating', 'review', 'pros', 'cons', 'bestFor', 'pricing', 'pricingPlans', 'knowledgeGraph'] },
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
  'Stage 4 — Populate the requested JSON only by extracting and condensing from the enhanced article. Do not independently regenerate or template the overview, feature highlights, pros, cons, pricingSummary, whoShouldBuy, whoShouldAvoid, faq, verdict, useCases, buyingGuide, alternatives, comparison, tutorial, seo, quality, or missingContent fields.',
  'Stage 5 — Validate the extracted JSON. Rewrite any field that contains generic marketing language, repeated sentence structures, unsupported claims, feature lists without explanation, identical use-case wording, empty buying guidance, copied-sounding phrasing, or low information gain against earlier sections.',
];

const EDITORIAL_STYLE_RULES = [
  'Every major feature discussed must answer all available knowledge graph fields: what it does, why it matters, who benefits most, real-world example, tradeoff or limitation, and recommended workflow.',
  'Never merely list features. Explain what the feature changes in a real workflow, when that change matters, and what limitation keeps the advice balanced.',
  'Use concrete workflow examples, such as a team reviewing vendor agreements, a marketer preparing campaign variants, or a founder comparing launch tools, but only when the product facts support the scenario.',
  'Add buying guidance throughout: who should buy, why they should buy, who should skip and why, when a cheaper option is enough, when a premium plan is justified, and which competitor to evaluate first if the fit is wrong.',
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
      'Generate the review content as one cohesive editorial article first, then extract every section from that article using only the supplied factPack.',
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
      'Step 2: Extract Overview, Pros, Cons, Features, Pricing, Best Fit, Not a Fit, Use Cases, FAQs, and Verdict from that internal review into the expected JSON fields for storage. No section may be written independently or filled with fallback/template copy.',
      'Map Features to review.featureHighlights, Pricing to review.pricingSummary, Best Fit to review.whoShouldBuy, Not a Fit to review.whoShouldAvoid, FAQs to review.faq, and Verdict to review.verdict.',
      'Overview must summarize what the product is, who it serves, primary strengths, and primary use cases without copied wording.',
      'Features must cover every available knowledge graph field naturally. Use cases must read as mini case studies with scenario, problem, product workflow, and expected outcome; generate 5-10 distinct workflows when enough facts exist.',
      'Pros must come from supplied strengths, reviews, ratings, or feature facts; cons must be realistic tradeoffs from supplied cons, notFor, or missing capabilities. Best Fit and Not a Fit must provide buying advice, not database-style audience labels.',
      'Pricing must mention free plans, paid plans, and enterprise availability only when supplied in pricing or pricingPlans.',
      'FAQ questions must be product-specific and should not be identical across products.',
      'Set quality.overall to 95+ only when the draft is factually grounded, specific, unique, SEO complete, product relevant, and free of unsupported claims.',
      'Subtract quality points for generic wording, hallucinated features, copied sections, repeated FAQs, repeated pros/cons, and unsupported claims.',
      'Produce a utilizationReport that counts used / total facts for Features, Pros, Cons, Reviewer Intelligence, Workflows, Alternatives, Pricing Guidance, Buyer Advice, Strengths, Weaknesses, Pricing Tradeoffs, and Examples. Also produce informationGain for every review section, scoring new facts introduced and listing repeated ideas, repeated sentences, repeated examples, and repeated workflows; every section must pass or be rewritten.',
      'If utilizationReport.overallCoverage would be below 90, revise the internal review before extraction until it reaches at least 90 without forcing awkward prose or inventing facts.',
      'List any missing or unsupported source needs in missingContent instead of guessing.',
    ].join(' '),
    expectedJson: { review: { overview: ['string'], pros: ['string'], cons: ['string'], whoShouldBuy: ['string'], whoShouldAvoid: ['string'], pricingSummary: 'string', featureHighlights: ['string'], verdict: 'string', faq: [{ question: 'string', answer: 'string' }] }, buyingGuide: [{ category: 'string', whyMadeTheList: 'string', bestUseCase: 'string', whoShouldSkip: 'string', topCompetitor: 'string', quickSummary: 'string' }], alternatives: [{ slug: 'string', name: 'string', bestFor: 'string', biggestStrength: 'string', biggestWeakness: 'string', whySomeoneWouldSwitch: 'string' }], comparison: [{ competitorSlug: 'string', competitorName: 'string', mainDifference: 'string', whenProductWins: 'string', whenCompetitorWins: 'string', recommendation: 'string' }], tutorial: { title: 'string', steps: ['string'], summary: 'string' }, seo: { title: 'string', metaDescription: 'string', openGraphDescription: 'string', twitterDescription: 'string', searchSnippet: 'string', shortSummary: 'string', longSummary: 'string', scores: { uniqueness: 0, keywordCoverage: 0, contentCompleteness: 0 } }, quality: { specificity: 0, readability: 0, productRelevance: 0, seoCoverage: 0, contentDepth: 0, internalLinking: 0, factualAccuracy: 0, uniqueness: 0, unsupportedClaims: 0, overall: 0, recommendations: ['string'] }, missingContent: { missing: ['string'], recommendations: ['string'] }, informationGain: [{ section: 'overview', newFactsIntroduced: 0, repeatedIdeas: ['string'], repeatedSentences: ['string'], repeatedExamples: ['string'], repeatedWorkflows: ['string'], passed: true, notes: 'string' }] },
    factPack: input,
    promptVersion: PROMPT_VERSION,
  };
}
