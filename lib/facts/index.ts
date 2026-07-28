import factSystem from './system';

export type ClaimClassification = 'VERIFIED' | 'INFERRED' | 'OPINION' | 'EDITORIAL' | 'UNKNOWN';
export type ClaimStatus = 'SUPPORTED' | 'PARTIALLY SUPPORTED' | 'UNSUPPORTED' | 'UNKNOWN';
export type FactCitationMap = Record<string, string[]>;

export const {
  REQUIRED_FIELDS,
  canonicalProduct,
  buildRegistry,
  buildFactCitations,
  extractClaims,
  validateReview,
  staleFacts,
} = factSystem;
