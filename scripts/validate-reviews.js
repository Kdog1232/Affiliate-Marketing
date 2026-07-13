#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const productsDir = path.join(root, 'products');
const docsPath = path.join(root, 'docs', 'review-completeness.md');
const PLACEHOLDER_RE = /lorem ipsum|\bTODO\b|YOURAFFILIATELINK|replaceable|placeholder|placehold\.co|example\.com|copy this json|duplicate this page/i;
const TEMPLATE_BLEED_TERMS = ['Brand Kits', 'Conversion Scores', 'Conversion Scoring', 'Product Visuals', 'Creative Exports'];
const GENERIC_REVIEW_PHRASES = ['human review recommended', 'compare on pricing, core features, ease of use', 'for the right audience', 'practical fit check'];

const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json')).sort();
const products = files.map(file => ({ file, path: path.join(productsDir, file), data: JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf8')) }));
const productNames = products.map(p => p.data.name).filter(Boolean);
function flatten(value, loc = '$', out = []) {
  if (typeof value === 'string') out.push({ loc, value });
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${loc}[${i}]`, out));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => flatten(v, loc === '$' ? k : `${loc}.${k}`, out));
  return out;
}
function hasText(v) { return typeof v === 'string' && v.trim().length > 0; }
function count(v) { return Array.isArray(v) ? v.length : 0; }
function existsAsset(ref) {
  if (!hasText(ref)) return false;
  if (/^https?:\/\//i.test(ref)) return !PLACEHOLDER_RE.test(ref);
  return fs.existsSync(path.join(root, ref.replace(/^\//, ''))) || fs.existsSync(path.join(root, 'public', ref.replace(/^\//, '')));
}
function okComparison(p) {
  return (Array.isArray(p.comparison) && p.comparison.length > 0 && p.comparison.every(r => hasText(r.feature) && hasText(r.product) && hasText(r.competitors) && hasText(r.winner))) ||
    (p.comparisonMatrix && Array.isArray(p.comparisonMatrix.columns) && p.comparisonMatrix.columns.length >= 2 && Array.isArray(p.comparisonMatrix.rows) && p.comparisonMatrix.rows.length > 0);
}
function schemaOk(p) {
  return hasText(p.name) && hasText(p.description) && hasText(p.heroImage) && hasText(p.review?.author) && hasText(p.review?.title) && hasText(p.review?.summary) && hasText(p.review?.datePublished) && hasText(p.affiliateLink) && p.rating && p.reviewCount && Array.isArray(p.faq) && p.faq.length >= 1;
}
function locationsForMatches(strings, re) { return strings.filter(s => re.test(s.value)).map(s => s.loc); }

const reports = [];
let hardFailures = 0;
for (const item of products) {
  const p = item.data;
  const strings = flatten(p);
  const checks = [
    ['Logo', existsAsset(p.logo)],
    ['Hero screenshot', existsAsset(p.heroImage)],
    ['Screenshots (real WebP)', count(p.screenshots) >= 1 && p.screenshots.every((asset) => /\.webp$/i.test(asset) && existsAsset(asset))],
    ['Features (6+)', count(p.features) >= 6],
    ['Pros (5+)', count(p.pros) >= 5],
    ['Cons (3+)', count(p.cons) >= 3],
    ['Pricing plans (3+)', count(p.pricingPlans) >= 3 || (p.pricingStructure && count(p.pricingStructure.plans) >= 3)],
    ['Best For cards (5+)', count(p.audiences) >= 5 || count(p.bestForCards) >= 5],
    ['Not For cards (3+)', count(p.notFor) >= 3],
    ['Use cases (5+)', count(p.useCases) >= 5],
    ['Alternatives (4+)', count(p.alternatives) >= 4],
    ['Comparison table', okComparison(p)],
    ['FAQs (12+)', count(p.faq) >= 12],
    ['Review summary', hasText(p.review?.summary)],
    ['Verdict', hasText(p.verdict) || hasText(p.review?.summary)],
    ['Affiliate link', hasText(p.affiliateLink) && !PLACEHOLDER_RE.test(p.affiliateLink)],
    ['SEO title', hasText(p.seoTitle)],
    ['Meta description', hasText(p.metaDescription) || hasText(p.description)],
    ['Keywords', count(p.keywords) > 0 || count(p.seoKeywords) > 0],
    ['Schema fields', schemaOk(p)],
  ];

  const quality = [];
  const placeholderLocs = locationsForMatches(strings, PLACEHOLDER_RE);
  if (placeholderLocs.length) quality.push({ label: 'Placeholder strings', locations: placeholderLocs });
  const emptyArrays = [];
  (function findEmpty(v, loc = '$') { if (Array.isArray(v) && v.length === 0) emptyArrays.push(loc); else if (v && typeof v === 'object') Object.entries(v).forEach(([k,val]) => findEmpty(val, loc === '$' ? k : `${loc}.${k}`)); })(p);
  if (emptyArrays.length) quality.push({ label: 'Empty arrays', locations: emptyArrays });

  const featureNames = new Set((p.features || []).map(feature => String(feature.title || '').toLowerCase()));
  const planNames = new Set((p.pricingPlans || []).map(plan => String(plan.name || '').toLowerCase()));
  for (const term of TEMPLATE_BLEED_TERMS) {
    const termRe = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const supported = featureNames.has(term.toLowerCase()) || planNames.has(term.toLowerCase());
    const locs = locationsForMatches(strings, termRe);
    if (!supported && locs.length) quality.push({ label: `Unsupported template feature: ${term}`, locations: locs });
  }
  for (const phrase of GENERIC_REVIEW_PHRASES) {
    const phraseRe = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const locs = locationsForMatches(strings, phraseRe);
    if (locs.length) quality.push({ label: `Generic review wording: ${phrase}`, locations: locs });
  }
  for (const other of productNames.filter(n => n !== p.name)) {
    const re = new RegExp(other.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const locs = locationsForMatches(strings, re).filter(loc => !loc.startsWith('alternatives[') && !loc.startsWith('knowledgeGraph.facts.alternatives[') && !loc.startsWith('faq[') && !loc.startsWith('comparison['));
    if (locs.length > 1) quality.push({ label: `Contains references to ${other}`, locations: locs });
  }


  const passed = checks.filter(([, pass]) => pass).length;
  const score = Math.round((passed / checks.length) * 100);
  p.reviewScore = `${score}%`;
  p.reviewStatus = score >= 90 && quality.length === 0 ? 'Ready to Publish' : 'Needs Work';
  fs.writeFileSync(item.path, `${JSON.stringify(p, null, 2)}\n`);
  if (quality.length) hardFailures += quality.length;
  reports.push({ item, checks, score, quality, status: p.reviewStatus });
}

for (const r of reports) {
  console.log(`\n${r.item.data.name}\nScore: ${r.score}%`);
  r.checks.forEach(([label, pass]) => console.log(`${pass ? '✓' : '✗'} ${label}`));
  if (r.quality.length) {
    console.log('\nWARNING');
    r.quality.forEach(q => console.log(`- ${q.label}\n  Location: ${q.locations.slice(0, 12).join(', ')}${q.locations.length > 12 ? ', …' : ''}`));
  }
}
const md = ['# Review Completeness', '', `Generated: ${new Date().toISOString()}`, '', '| Product | Score | Status | Missing checks | Quality warnings |', '|---|---:|---|---|---|'];
for (const r of reports) {
  const missing = r.checks.filter(([, pass]) => !pass).map(([label]) => label).join(', ') || 'None';
  const warnings = r.quality.map(q => q.label).join('; ') || 'None';
  md.push(`| ${r.item.data.name} | ${r.score}% | ${r.status} | ${missing.replace(/\|/g, '\\|')} | ${warnings.replace(/\|/g, '\\|')} |`);
}
fs.writeFileSync(docsPath, `${md.join('\n')}\n`);
console.log(`\nWrote ${path.relative(root, docsPath)}`);
if (hardFailures) {
  console.error(`\nReview validation failed with ${hardFailures} quality warning group(s).`);
  process.exit(1);
}
