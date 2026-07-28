'use strict';

const crypto = require('crypto');

const REQUIRED_FIELDS = [
  'productName', 'vendor', 'officialUrl', 'officialDocumentation', 'pricing',
  'freePlan', 'trial', 'platforms', 'supportedOperatingSystems',
  'supportedIntegrations', 'languages', 'aiModels', 'features', 'limitations',
  'security', 'compliance', 'apiAvailability', 'targetUsers', 'useCases',
  'competitors', 'affiliateUrl', 'logo', 'screenshots', 'releaseDate',
  'lastVerifiedDate',
];

const VOLATILE_FIELDS = new Set(['pricing', 'freePlan', 'trial', 'features', 'supportedIntegrations', 'officialDocumentation']);
const FACTUAL_FIELDS = new Set(REQUIRED_FIELDS.filter((field) => !['lastVerifiedDate'].includes(field)));

function canonicalProduct(product, metadata = {}) {
  const officialUrl = metadata.officialUrl || product.officialUrl || nonAffiliateUrl(product.affiliateLink);
  const model = {
    productName: product.name ?? null,
    vendor: product.vendor ?? product.name ?? null,
    officialUrl: officialUrl ?? null,
    officialDocumentation: metadata.officialDocumentation || product.officialDocumentation || [],
    pricing: product.pricingPlans?.length ? product.pricingPlans : (product.pricing ?? null),
    freePlan: freePlan(product),
    trial: product.trial ?? null,
    platforms: product.platforms ?? [],
    supportedOperatingSystems: product.supportedOperatingSystems ?? [],
    supportedIntegrations: product.supportedIntegrations ?? [],
    languages: product.languages ?? [],
    aiModels: product.aiModels ?? [],
    features: product.features ?? [],
    limitations: product.practicalLimitations ?? product.cons ?? [],
    security: product.security ?? [],
    compliance: product.compliance ?? [],
    apiAvailability: product.apiAvailability ?? null,
    targetUsers: product.idealUsers ?? product.bestFor ?? product.users ?? [],
    useCases: product.useCases ?? [],
    competitors: (product.alternatives ?? []).map((item) => item.name),
    affiliateUrl: product.affiliateLink ?? null,
    logo: product.logo ?? null,
    screenshots: product.screenshots ?? (product.heroImage ? [product.heroImage] : []),
    releaseDate: product.releaseDate ?? null,
    lastVerifiedDate: metadata.lastVerifiedDate || product.lastVerifiedDate || null,
  };
  return { schemaVersion: 1, slug: product.slug, ...model };
}

function buildRegistry(canonical, metadata = {}) {
  const facts = {};
  for (const field of REQUIRED_FIELDS) {
    const value = canonical[field];
    if (isMissing(value)) continue; // Absence is explicit: generators cannot fill it.
    flatten(value, field, facts, {
      sourceType: metadata.sourceType || 'approved_manual',
      sourceUrl: sourceFor(field, canonical, metadata),
      verifiedAt: metadata.fieldVerifiedAt?.[field] || canonical.lastVerifiedDate,
    });
  }
  return { schemaVersion: 1, productSlug: canonical.slug, facts };
}

function flatten(value, path, facts, source) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${path}.${index}`, facts, source));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => flatten(item, `${path}.${key}`, facts, source));
    return;
  }
  if (isMissing(value)) return;
  facts[path] = { id: path, value, classification: 'VERIFIED', ...source };
}

function extractClaims(review) {
  const claims = [];
  for (const [sectionKey, section] of Object.entries(review.sections || {})) {
    for (const paragraph of sectionParagraphs(section.content)) {
      for (const sentence of splitSentences(paragraph.text)) {
        claims.push({ section: sectionKey, paragraph: paragraph.index, text: sentence, classification: ['whoShouldBuy', 'whoShouldAvoid', 'verdict'].includes(sectionKey) ? 'OPINION' : classifyClaim(sentence) });
      }
    }
  }
  return claims;
}

function validateReview(review, registry, options = {}) {
  const citations = review.factCitations || {};
  const claims = extractClaims(review).map((claim) => {
    const key = `${claim.section}.${claim.paragraph}`;
    const factIds = citations[key] || [];
    const missingIds = factIds.filter((id) => !registry.facts[id]);
    const supportedIds = factIds.filter((id) => registry.facts[id] && id !== 'productName' && factSupportsClaim(claim.text, registry.facts[id]));
    let status;
    if (claim.classification === 'OPINION' || claim.classification === 'EDITORIAL') status = 'SUPPORTED';
    else if (!factIds.length) status = 'UNKNOWN';
    else if (missingIds.length === factIds.length || !supportedIds.length) status = 'UNSUPPORTED';
    else if (missingIds.length) status = 'PARTIALLY SUPPORTED';
    else status = 'SUPPORTED';
    return { ...claim, factIds, supportingFactIds: supportedIds, missingFactIds: missingIds, status };
  });
  const unsupported = claims.filter((claim) => claim.status === 'UNSUPPORTED' || claim.status === 'PARTIALLY SUPPORTED');
  const unknown = claims.filter((claim) => claim.status === 'UNKNOWN');
  const contradictions = detectContradictions(claims);
  const verified = claims.filter((claim) => claim.status === 'SUPPORTED');
  const factual = claims.filter((claim) => claim.classification === 'VERIFIED' || claim.classification === 'INFERRED' || claim.classification === 'UNKNOWN');
  const accuracyScore = factual.length ? Math.round(100 * factual.filter((claim) => claim.status === 'SUPPORTED').length / factual.length) : 100;
  const used = new Set(claims.flatMap((claim) => claim.factIds).filter((id) => registry.facts[id]));
  const report = {
    productSlug: review.productSlug,
    overallAccuracyScore: accuracyScore,
    verifiedClaims: verified.length,
    unsupportedClaims: unsupported,
    unknownClaims: unknown,
    conflictingClaims: contradictions,
    missingFacts: REQUIRED_FIELDS.filter((field) => !Object.keys(registry.facts).some((id) => id === field || id.startsWith(`${field}.`))),
    lastVerificationDate: registry.facts.lastVerifiedDate?.value ?? null,
    officialSourcesUsed: [...new Set([...used].map((id) => registry.facts[id].sourceUrl).filter(Boolean))],
    factCoveragePercent: Object.keys(registry.facts).length ? Math.round(100 * used.size / Object.keys(registry.facts).length) : 0,
    hallucinationRisk: unsupported.length || unknown.length ? 'HIGH' : accuracyScore < 100 ? 'MEDIUM' : 'LOW',
  };
  report.publicationStatus = accuracyScore >= (options.minimumScore ?? 98) && !unsupported.length && !unknown.length && !contradictions.length ? 'APPROVED' : 'REJECTED';
  return report;
}

function staleFacts(registry, now = new Date(), days = 30) {
  const cutoff = now.getTime() - days * 86400000;
  return Object.values(registry.facts).filter((fact) => VOLATILE_FIELDS.has(fact.id.split('.')[0]) && (!fact.verifiedAt || Date.parse(fact.verifiedAt) < cutoff));
}

function buildFactCitations(review, registry, sectionFields = {}) {
  const result = {};
  for (const [sectionKey, section] of Object.entries(review.sections || {})) {
    const roots = sectionFields[sectionKey] || defaultSectionFields(sectionKey);
    const ids = Object.keys(registry.facts).filter((id) => roots.some((root) => id === root || id.startsWith(`${root}.`)));
    for (const paragraph of sectionParagraphs(section.content)) result[`${sectionKey}.${paragraph.index}`] = ids;
  }
  return result;
}

function defaultSectionFields(section) {
  const common = ['productName', 'targetUsers', 'features', 'limitations', 'platforms'];
  if (section === 'pricingSummary') return ['productName', 'pricing', 'freePlan', 'trial'];
  if (section === 'pros' || section === 'useCases') return ['productName', 'features', 'useCases', 'targetUsers'];
  if (section === 'cons' || section === 'whoShouldAvoid') return ['productName', 'limitations', 'targetUsers'];
  if (section === 'faq') return [...REQUIRED_FIELDS];
  if (section === 'verdict') return [...common, 'pricing', 'freePlan', 'competitors', 'useCases'];
  return common;
}

function classifyClaim(sentence) {
  if (/\b(I think|we think|in our view|worth|best|better|choose|ideal|recommend|should|compelling)\b/i.test(sentence)) return 'OPINION';
  if (/\b(this review|our verdict|we (?:would|prefer)|editorial)\b/i.test(sentence)) return 'EDITORIAL';
  if (/\b(likely|may|might|can help|appears|suggests)\b/i.test(sentence)) return 'INFERRED';
  return 'VERIFIED';
}

function factSupportsClaim(claim, fact) {
  const claimTokens = meaningfulTokens(claim);
  const valueTokens = meaningfulTokens(String(fact.value));
  if (!valueTokens.size) return false;
  return [...valueTokens].some((token) => claimTokens.has(token));
}

function meaningfulTokens(value) {
  const stop = new Set(['about','after','also','and','are','because','before','but','can','could','for','from','has','have','into','its','more','not','only','or','our','than','that','the','their','then','there','these','they','this','through','to','use','used','user','users','when','where','which','while','who','will','with','work','workflow','you','your']);
  return new Set(normalize(value).split(' ').filter((token) => token.length > 2 && !stop.has(token)));
}

function detectContradictions(claims) {
  const conflicts = [];
  for (let i = 0; i < claims.length; i += 1) for (let j = i + 1; j < claims.length; j += 1) {
    const a = normalize(claims[i].text); const b = normalize(claims[j].text);
    if (a.replace(/\b(not|no|doesnt|isnt|cannot)\b/g, '') === b.replace(/\b(not|no|doesnt|isnt|cannot)\b/g, '') && /\b(not|no|doesnt|isnt|cannot)\b/.test(a) !== /\b(not|no|doesnt|isnt|cannot)\b/.test(b)) conflicts.push([claims[i], claims[j]]);
  }
  return conflicts;
}

function sectionParagraphs(content) {
  if (typeof content === 'string') return [{ index: 0, text: content }];
  if (!Array.isArray(content)) return [];
  return content.map((item, index) => ({ index, text: typeof item === 'string' ? item : `${item.question || ''} ${item.answer || ''}`.trim() }));
}
function splitSentences(text) {
  const sentences = text.split(/(?<=[.!?])\s+/).map((value) => value.trim()).filter(Boolean);
  return sentences.reduce((result, sentence) => {
    if (result.length && sentence.split(/\s+/).length <= 2) result[result.length - 1] += ` ${sentence}`;
    else result.push(sentence);
    return result;
  }, []);
}
function normalize(value) { return value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }
function freePlan(product) { if (product.freePlan !== undefined) return product.freePlan; const text = JSON.stringify(product.pricing ?? '').toLowerCase(); return text.includes('free') ? true : null; }
function sourceFor(field, canonical, metadata) { return metadata.fieldSources?.[field] || (FACTUAL_FIELDS.has(field) ? canonical.officialUrl : null); }
function nonAffiliateUrl(value) { try { const url = new URL(value); return `${url.protocol}//${url.host}/`; } catch { return null; } }
function isMissing(value) { return value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length); }
function registryHash(registry) { return crypto.createHash('sha256').update(JSON.stringify(registry)).digest('hex'); }

module.exports = { REQUIRED_FIELDS, VOLATILE_FIELDS, canonicalProduct, buildRegistry, buildFactCitations, extractClaims, validateReview, staleFacts, classifyClaim, registryHash };
