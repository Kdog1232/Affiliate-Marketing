import type { Product } from '@/lib/products';
import type { ReviewDraft } from './types';

export type ConsistencyMismatch = { field: string; message: string };

function textEntries(value: unknown, field = '$', output: { field: string; text: string }[] = []) {
  if (typeof value === 'string') output.push({ field, text: value });
  else if (Array.isArray(value)) value.forEach((item, index) => textEntries(item, `${field}[${index}]`, output));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => textEntries(item, `${field}.${key}`, output));
  return output;
}

function supportedCompetitors(product: Product) {
  return new Map([
    ...(product.alternatives ?? []).filter((item) => item.slug).map((item) => [item.slug!, item.name] as const),
    ...(product.knowledgeGraph?.facts.alternatives ?? []).filter((item) => item.slug).map((item) => [item.slug!, item.product] as const),
  ]);
}

export function reviewConsistencyMismatches(product: Product, draft: ReviewDraft, allProducts: Product[] = []): ConsistencyMismatch[] {
  const mismatches: ConsistencyMismatch[] = [];
  const add = (field: string, message: string) => mismatches.push({ field, message });
  if (draft.slug !== product.slug) add('slug', `expected ${product.slug}, received ${draft.slug}`);
  if (draft.productSlug !== product.slug) add('productSlug', `expected ${product.slug}, received ${draft.productSlug}`);
  const snapshot = draft.productSnapshot;
  if (snapshot.slug !== product.slug || snapshot.name !== product.name) add('productSnapshot', `expected identity ${product.name} (${product.slug})`);
  if (snapshot.logo !== product.logo) add('productSnapshot.logo', `expected ${product.logo}, received ${snapshot.logo}`);
  if (snapshot.affiliateLink !== product.affiliateLink) add('productSnapshot.affiliateLink', `expected ${product.affiliateLink}, received ${snapshot.affiliateLink}`);
  if (JSON.stringify(snapshot.pricing) !== JSON.stringify(product.pricing)) add('productSnapshot.pricing', 'does not match the canonical product pricing');

  const expectedCanonicals = new Set([product.canonicalUrl, `/${product.slug}`, `/reviews/${product.slug}`].filter(Boolean));
  if (!expectedCanonicals.has(draft.seo.canonical)) add('seo.canonical', `URL does not belong to ${product.slug}: ${draft.seo.canonical}`);
  if (!draft.seo.title.toLocaleLowerCase().includes(product.name.toLocaleLowerCase())) add('seo.title', `must contain the current product name, ${product.name}`);

  const competitors = supportedCompetitors(product);
  for (const item of draft.assets?.alternatives ?? []) {
    if (competitors.get(item.slug) !== item.name) add('assets.alternatives', `unsupported or mismatched alternative ${item.name} (${item.slug})`);
  }
  for (const item of draft.assets?.comparison ?? []) {
    if (competitors.get(item.competitorSlug) !== item.competitorName) add('assets.comparison', `unsupported or mismatched competitor ${item.competitorName} (${item.competitorSlug})`);
  }

  const allowedNames = new Set([product.name.toLocaleLowerCase(), ...competitors.values()].map((name) => name.toLocaleLowerCase()));
  for (const other of allProducts) {
    if (other.slug === product.slug || allowedNames.has(other.name.toLocaleLowerCase()) || product.name.toLocaleLowerCase().includes(other.name.toLocaleLowerCase())) continue;
    const escaped = other.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'iu');
    for (const entry of textEntries({ sections: draft.sections, seo: draft.seo, assets: draft.assets })) {
      if (pattern.test(entry.text)) add(entry.field, `references unrelated product ${other.name}`);
    }
  }
  return mismatches;
}

export function assertReviewConsistency(product: Product, draft: ReviewDraft, allProducts: Product[] = []) {
  const mismatches = reviewConsistencyMismatches(product, draft, allProducts);
  if (mismatches.length) throw new Error(`Review consistency validation failed for ${product.slug}:\n${mismatches.map((item) => `- ${item.field}: ${item.message}`).join('\n')}`);
}
