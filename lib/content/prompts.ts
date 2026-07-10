import type { Product } from '@/lib/products';
import type { ReviewSectionKey } from './types';

export const REVIEW_SECTIONS: { key: ReviewSectionKey; title: string; sourceFields: string[] }[] = [
  { key: 'overview', title: 'Overview', sourceFields: ['name', 'tagline', 'description', 'features', 'categories', 'platforms'] },
  { key: 'pros', title: 'Pros', sourceFields: ['pros', 'features', 'rating'] },
  { key: 'cons', title: 'Cons', sourceFields: ['cons', 'notFor'] },
  { key: 'pricingSummary', title: 'Pricing Summary', sourceFields: ['pricing', 'pricingPlans'] },
  { key: 'whoShouldBuy', title: 'Who Should Buy', sourceFields: ['audiences', 'bestFor', 'useCases'] },
  { key: 'whoShouldAvoid', title: 'Who Should Avoid', sourceFields: ['notFor', 'cons'] },
  { key: 'useCases', title: 'Use Cases', sourceFields: ['useCases', 'features'] },
  { key: 'faq', title: 'FAQ', sourceFields: ['faq', 'pricing', 'features'] },
  { key: 'verdict', title: 'Final Verdict', sourceFields: ['rating', 'review', 'pros', 'cons', 'bestFor'] },
];

export function systemPrompt() { return ['You are an experienced software review editor.', 'Write polished, factual, SEO-friendly review copy.', 'Never mention AI assistance, content generation, prompts, or internal workflow.', 'Do not invent facts. Use only the provided product JSON.', 'Return strict JSON matching the requested shape.'].join('\n'); }
export function sectionPrompt(product: Product, section: ReviewSectionKey) {
  const spec = REVIEW_SECTIONS.find((item) => item.key === section);
  if (!spec) throw new Error(`Unknown section: ${section}`);
  return { instructions: `Generate only the ${spec.title} section. Keep it publication-ready and fact-bound.`, expectedJson: expectedShape(section), productJson: JSON.stringify(pick(product, spec.sourceFields), null, 2) };
}
function expectedShape(section: ReviewSectionKey) { if (section === 'faq') return '{ "content": [{ "question": "...", "answer": "..." }] }'; if (['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(section)) return '{ "content": ["..."] }'; return '{ "content": "..." }'; }
function pick(product: Product, fields: string[]) { return Object.fromEntries(fields.map((field) => [field, (product as unknown as Record<string, unknown>)[field]])); }
