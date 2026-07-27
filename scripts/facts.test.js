'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { canonicalProduct, buildRegistry, buildFactCitations, extractClaims, staleFacts, validateReview } = require('../lib/facts/system');

const product = { slug: 'example', name: 'Example', affiliateLink: 'https://example.com/go', pricing: { freePlan: 'Available' }, pricingPlans: [], platforms: ['Web'], features: [{ title: 'PDF reader', description: 'Reads PDF documents' }], cons: ['No native mobile app'], bestFor: ['Researchers'], heroImage: '/example.png' };
const metadata = { officialUrl: 'https://example.com/', lastVerifiedDate: '2026-07-27T00:00:00.000Z', sourceType: 'official' };
const registry = buildRegistry(canonicalProduct(product, metadata), metadata);

function reviewWith(content) {
  const review = { productSlug: 'example', sections: { overview: { content } } };
  review.factCitations = buildFactCitations(review, registry);
  return review;
}

test('extracts atomic claims and accepts cited canonical facts', () => {
  const review = reviewWith('Example reads PDF documents. Example is available on the Web.');
  assert.equal(extractClaims(review).length, 2);
  assert.equal(validateReview(review, registry).publicationStatus, 'APPROVED');
});

test('rejects invented integrations even when the paragraph has citations', () => {
  const report = validateReview(reviewWith('Example integrates with Google Drive.'), registry);
  assert.equal(report.publicationStatus, 'REJECTED');
  assert.equal(report.unsupportedClaims.length, 1);
});

test('rejects factual paragraphs without citation metadata as unknown', () => {
  const report = validateReview({ productSlug: 'example', sections: { overview: { content: 'Example reads PDF documents.' } } }, registry);
  assert.equal(report.unknownClaims.length, 1);
});

test('flags volatile facts after thirty days', () => {
  assert.ok(staleFacts(registry, new Date('2026-08-27T00:00:01.000Z')).some((fact) => fact.id.startsWith('pricing.')));
});
