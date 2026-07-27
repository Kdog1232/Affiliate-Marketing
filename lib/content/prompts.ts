import type { ReviewSectionKey } from './types';

export const PROMPT_VERSION = 'decision-first-expert-review-v5-isolated';
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
  'The factPack.product is the only review subject. Never reuse a name, URL, logo, price, CTA, FAQ, verdict, or claim remembered from another review.',
  'Competitor names may appear only when supplied in this factPack, and must retain their supplied name and slug. Recheck every JSON field against factPack.product.slug and factPack.product.name before returning it.',
  'Pricing must use only provided plan names and prices. Never create Starter, Professional, Agency, Team, or Enterprise plans unless those exact plans are supplied.',
  'Alternatives and comparisons must come from the supplied alternatives, comparisons, or existingComparisonRows lists.',
  'Every recommendation must be grounded in the supplied pros, cons, audiences, notFor, features, use cases, pricing, comparison data, or capabilities registry.',
  'Before generating any workflow or stack, read the capabilities registry in the factPack, determine each software product’s primaryRole, assign exactly one responsibility to each tool, and never duplicate responsibilities across tools in the same workflow.',
  'Every software recommendation must describe the primary job that software actually performs. Ask privately: Would a real software engineer agree this is what this product actually does? If no, rewrite it.',
  'No recommendation may use interchangeable wording such as extends workflow, supports production, helps planning, creates deliverables, robust solution, or streamlines workflow. Explain what actually happens in that product.',
];

const EDITORIAL_PIPELINE = [
  'Run this private workflow before producing the JSON. Do not expose the workflow, productUnderstanding, draftArticle, enhancement notes, validation notes, or any chain-of-thought.',
  'Stage 1 — Build a Product Understanding object from the supplied facts and capabilities registry with primaryAudience, primaryRole, oneResponsibility, primaryJobs, biggestStrengths, biggestWeaknesses, differentiators, idealWorkflows, likelyAlternatives, marketFit, and situationsWhereAnotherToolWouldBeBetter.',
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

const EXPERT_REVIEW_REQUIREMENTS = [
  'Open on the buyer\'s actual decision or frustration, then name the central tradeoff. Never begin with What is [product], a dictionary definition, or generic market context.',
  'Write with the judgment of a reviewer who understands the category, but never imply hands-on access unless the factPack explicitly documents testing. When it does not, disclose once: "Based on the product documentation, public demonstrations, and feature comparisons..." Then distinguish observed facts from editorial inference.',
  'Include distinct, product-specific observations covering what surprised the reviewer, what worked well, what caused friction, what should improve, what the reviewer would do differently, who should buy, who should avoid, and when another named tool is better. These may be woven into the available fields rather than forced under identical headings.',
  'Never invent a click path, anecdote, benchmark, elapsed time, output result, customer quotation, test device, or usage claim. A realistic scenario must be labelled as a workflow example, not presented as something the reviewer personally did.',
  'Address time-to-value, learning curve, migration or switching difficulty, long-term scalability, hidden limitations, unexpected strengths, likely outgrowth points, and common beginner mistakes whenever the supplied facts support a useful conclusion. Explicitly state when the evidence is insufficient.',
  'Compare the product contextually with supplied competitors throughout the review, not only in comparison data. Explain the job on which each wins, the buyer for whom that difference matters, and the cost or workflow tradeoff. Never make an unsupported winner claim.',
  'After each major topic, answer So what? with a concrete purchase, plan, workflow, or avoidance decision. A feature description without its decision consequence fails review.',
  'Keep the article visually scannable in its eventual rendering. Roughly every 150-250 words, provide material suitable for a quick takeaway, warning, pro tip, common mistake, recommendation, short quote, checklist, or comparison table. Rotate callout types instead of repeating one formula.',
  'CTAs must educate: tell the reader what current price, limit, policy, or workflow fit to verify. Never use Buy Now, Try Now, act fast, best-in-class, game-changing, or similar sales pressure.',
  'End with a decision matrix whose recommendations clearly cover Buy it if, Skip it if, Choose this competitor if, and Wait if. Finish with one low-pressure CTA to verify the latest relevant details.',
  'Continuously create information gain. Reject filler, predictable transitions, keyword stuffing, repeated conclusions, and any paragraph that could be pasted into a competing product review by changing the product name.',
];

const UNIVERSAL_EDITORIAL_CHECKS = [
  'Edit rather than regenerate: preserve the draft\'s facts, recommendations, enhancement choices, field structure, and useful detail. Rewrite only a field or list item that fails a check below.',
  'Business reality: every proposed offer must be something a freelancer or small agency could explain in one sentence, sell on a marketplace such as Upwork, and deliver for a paying customer. Replace vague or implausible offers.',
  'Business naming: a business title must naturally identify the customer, service, or deliverable. Rename forced labels such as Client Portal Business when a concrete name such as Portal Development Agency describes the actual work.',
  'Tool accuracy: give each tool exactly one real primary responsibility supported by the capabilities registry. Do not blend products together, invent duties, or assign the same responsibility to two tools.',
  'Workflow logic: arrange only the stages the work needs, in the order a practitioner would use them—for example research, planning, creation, editing, review, publishing, marketing, automation, then support.',
  'Natural writing: replace supports workflows, extends workflows, covers remaining stages, helps planning, owns the core job, handles the workflow, and supports production with a concrete description of what the person does in the software.',
  'Section uniqueness: Skills, First Steps, Startup Cost, Why This Tool Helps, Why This Stack Works, Deliverables, Requirements, and Difficulty must use product- and offer-specific language, not stock sentences. Use the product slug as a variation cue, never mention that cue, and do not alter facts merely to sound different.',
  'Specificity: reject any sentence that could be pasted into many software reviews. Name the actual output, action, user, decision, limitation, or handoff.',
  'Educational value: every paragraph must give the buyer practical knowledge. Replace promotion-only copy with instruction, decision criteria, a tradeoff, or an example.',
  'Internal consistency: business title, audience, problem, deliverables, workflow, recommended tools, starter stack, growth roadmap, and Best Fit must describe the same offer and customer. Repair only the drifting field.',
  'Category-aware tone: write with the judgment of the relevant practitioner—such as a teacher, designer, marketer, agency owner, developer, or small-business operator. Never default to developer language for a non-developer product.',
  'Human experience: when the supplied facts allow it, include a useful mistake, frustration, limitation, review habit, or small productivity tip a regular user would recognize. Do not pretend to have personally tested the product or invent an anecdote.',
  'Universal validation: an experienced user should agree, a professional review site could publish the copy, and a first-time buyer should learn something useful. Rewrite only the field that makes an answer no.',
];

export function systemPrompt() {
  return [
    'You are an experienced software review editor creating publication-quality, fact-bound buying advice.',
    ...FACT_BOUND_RULES,
    ...EXPERT_REVIEW_REQUIREMENTS,
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
      ...EXPERT_REVIEW_REQUIREMENTS,
      'Step 1: First write an internal 2,500-word expert product review from the product facts. This draft is scratch work only: do not output it, do not format it as JSON, do not use a reusable template, and write it naturally with editorial judgment.',
      'Step 1 review requirements: cover overview, pros, cons, features, pricing, use cases, alternatives, buyer advice, FAQs, and verdict in connected expert prose; include product-specific context; avoid generic filler; keep every claim grounded in the supplied facts.',
      'Build the ending as a practical recommendation matrix: buy, skip, choose a named supplied competitor, or wait. The final line should invite the reader to verify current pricing or another decision-critical detail, not simply purchase.',
      'Knowledge Graph Utilization: naturally incorporate every major feature, workflow, pricing recommendation, reviewer intelligence insight, alternative comparison, buyer guidance point, strength, weakness, pricing tradeoff, and example present in the factPack.',
      'Editorial Expansion: whenever a feature or knowledge graph item contains whatItDoes, whyItMatters, example, whoBenefits, or tradeoff, discuss all available fields naturally; never mention only the feature name.',
      'Why This Matters: for every feature, explain why the reader should care, who benefits, and the practical outcome rather than simply summarizing the feature list.',
      'Reviewer Intelligence: every supplied insight such as Biggest Strength, Most Overrated Feature, Most Underrated Feature, Best Industry, Typical ROI, Learning Curve, Switching Cost, Best Upgrade Path, Ideal Buyer, and Not Ideal Buyer must appear naturally somewhere in the review, even if there is no dedicated page section.',
      'Workflow Expansion: before describing any workflow, use the capabilities registry to decide what gets built first, refined next, published, marketed, and automated. Each tool must appear only where it naturally belongs and must own one non-duplicated responsibility.',
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

/** Final, non-generative quality pass. It receives the already selected draft and
 * may repair weak copy, but cannot add capabilities or choose new enhancements. */
export function editorialReviewPrompt(factPack: unknown, draft: unknown, productSlug: string) {
  return {
    task: 'Perform the final universal editorial review of this completed draft.',
    instructions: [
      ...UNIVERSAL_EDITORIAL_CHECKS,
      ...EDITORIAL_STYLE_RULES,
      ...EXPERT_REVIEW_REQUIREMENTS,
      ...FACT_BOUND_RULES,
      'Keep the exact JSON shape and all required fields. Keep the number and identity of selected enhancements, alternatives, comparisons, tutorial steps, and recommendations unless an item is factually invalid; repair invalid wording in place rather than selecting a replacement.',
      'Do not add new facts, tools, prices, capabilities, audiences, offers, or sections. Do not summarize or regenerate the article. Return the full payload, copying every field that already passes unchanged.',
      'Treat the factPack and capabilities registry as the authority. The category and audience in those facts determine the professional voice.',
    ].join(' '),
    editorialVariationKey: productSlug,
    factPack,
    draft,
    expectedJsonShape: 'Exactly the same shape as draft.',
    promptVersion: PROMPT_VERSION,
  };
}
