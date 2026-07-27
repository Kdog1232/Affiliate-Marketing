export const REQUIRED_FIELDS: string[];
export function canonicalProduct(product: unknown, metadata?: unknown): { slug: string; lastVerifiedDate?: string };
export function buildRegistry(canonical: unknown, metadata?: unknown): { facts: Record<string, unknown> };
export function buildFactCitations(review: unknown, registry: unknown, sectionFields?: Record<string, string[]>): Record<string, string[]>;
export function extractClaims(review: unknown): unknown[];
export function validateReview(review: unknown, registry: unknown, options?: { minimumScore?: number }): { publicationStatus: 'APPROVED' | 'REJECTED'; unknownClaims: unknown[]; unsupportedClaims: unknown[]; conflictingClaims: unknown[] };
export function staleFacts(registry: unknown, now?: Date, days?: number): unknown[];

declare const factSystem: {
  REQUIRED_FIELDS: typeof REQUIRED_FIELDS;
  canonicalProduct: typeof canonicalProduct;
  buildRegistry: typeof buildRegistry;
  buildFactCitations: typeof buildFactCitations;
  extractClaims: typeof extractClaims;
  validateReview: typeof validateReview;
  staleFacts: typeof staleFacts;
};
export default factSystem;
