#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const productsDir = path.join(root, 'products');
const reportPath = path.join(root, 'docs', 'review-consistency-report.md');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json')).sort();
const products = files.map(file => ({ file, data: read(path.join(productsDir, file)) }));
const bySlug = new Map(products.map(item => [item.data.slug, item.data]));
const mismatches = [];
const add = (slug, field, type, message) => mismatches.push({ slug, field, type, message });
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function entries(value, field = '$', output = []) {
  if (typeof value === 'string') output.push({ field, text: value });
  else if (Array.isArray(value)) value.forEach((item, i) => entries(item, `${field}[${i}]`, output));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => entries(item, `${field}.${key}`, output));
  return output;
}
function competitors(product) {
  const result = new Map();
  for (const item of product.alternatives || []) result.set(item.slug || `name:${item.name}`, item.name);
  for (const item of product.knowledgeGraph?.facts?.alternatives || []) result.set(item.slug || `name:${item.product}`, item.product);
  return result;
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function productChecks(item) {
  const p = item.data;
  if (`${p.slug}.json` !== item.file) add(p.slug, 'slug', 'product name', `filename ${item.file} does not match slug ${p.slug}`);
  if (!p.name) add(p.slug, 'name', 'product name', 'current product name is empty');
  if (!p.affiliateLink) add(p.slug, 'affiliateLink', 'affiliate link', 'affiliate link is empty');
  else if (products.some(other => other.data.slug !== p.slug && other.data.affiliateLink === p.affiliateLink)) add(p.slug, 'affiliateLink', 'affiliate link', 'affiliate link is assigned to another product');
  if (p.canonicalUrl && !String(p.canonicalUrl).includes(`/${p.slug}`)) add(p.slug, 'canonicalUrl', 'URL', `canonical URL does not contain /${p.slug}`);
  if (!p.logo) add(p.slug, 'logo', 'logo', 'logo is empty');
  else {
    const owner = products.find(other => other.data.slug !== p.slug && other.data.logo === p.logo);
    if (owner) add(p.slug, 'logo', 'logo', `${p.logo} is also assigned to ${owner.data.name}`);
    if (!fs.existsSync(path.join(root, 'public', p.logo.replace(/^\//, '')))) add(p.slug, 'logo', 'logo', `${p.logo} does not exist`);
  }
  for (const [field, image] of [['heroImage', p.heroImage], ...(p.screenshots || []).map((v, i) => [`screenshots[${i}]`, v])]) {
    const owner = products.find(other => other.data.slug !== p.slug && (other.data.heroImage === image || (other.data.screenshots || []).includes(image)));
    if (image && owner) add(p.slug, field, 'screenshot', `${image} is assigned to ${owner.data.name}`);
  }
  findUnexpectedNames(p, { review: p.review, verdict: p.verdict, faq: p.faq, seoTitle: p.seoTitle, metaDescription: p.metaDescription, seoKeywords: p.seoKeywords, keywords: p.keywords }, competitors(p));
}
function findUnexpectedNames(product, value, allowed) {
  const allowedNames = new Set([product.name.toLowerCase(), ...allowed.values()].map(name => name.toLowerCase()));
  for (const other of products) {
    if (other.data.slug === product.slug || allowedNames.has(other.data.name.toLowerCase()) || product.name.toLowerCase().includes(other.data.name.toLowerCase())) continue;
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(other.data.name)}(?=$|[^\\p{L}\\p{N}])`, 'iu');
    for (const entry of entries(value)) if (re.test(entry.text)) add(product.slug, entry.field, entry.field.includes('faq') ? 'FAQ' : 'product name', `references unrelated product ${other.data.name}`);
  }
}
function draftChecks(product, draft, state, file) {
  const prefix = `${state}:${path.relative(root, file)}`;
  if (draft.slug !== product.slug) add(product.slug, `${prefix}.slug`, 'product name', `expected ${product.slug}, received ${draft.slug}`);
  if (draft.productSlug !== product.slug) add(product.slug, `${prefix}.productSlug`, 'product name', `expected ${product.slug}, received ${draft.productSlug}`);
  if (draft.productSnapshot?.name !== product.name || draft.productSnapshot?.slug !== product.slug) add(product.slug, `${prefix}.productSnapshot`, 'product name', `snapshot does not identify ${product.name}`);
  if (draft.productSnapshot?.affiliateLink !== product.affiliateLink) add(product.slug, `${prefix}.productSnapshot.affiliateLink`, 'affiliate link', 'does not match canonical product record');
  if (draft.productSnapshot?.logo !== product.logo) add(product.slug, `${prefix}.productSnapshot.logo`, 'logo', 'does not match canonical product record');
  if (!same(draft.productSnapshot?.pricing, product.pricing)) add(product.slug, `${prefix}.productSnapshot.pricing`, 'pricing', 'does not match canonical product record');
  const canonicals = new Set([product.canonicalUrl, `/${product.slug}`, `/reviews/${product.slug}`].filter(Boolean));
  if (!canonicals.has(draft.seo?.canonical)) add(product.slug, `${prefix}.seo.canonical`, 'URL', `${draft.seo?.canonical} does not belong to current product`);
  if (!String(draft.seo?.title || '').toLowerCase().includes(product.name.toLowerCase())) add(product.slug, `${prefix}.seo.title`, 'metadata', `does not contain ${product.name}`);
  const allowed = competitors(product);
  for (const [i, alt] of (draft.assets?.alternatives || []).entries()) if (allowed.get(alt.slug) !== alt.name) add(product.slug, `${prefix}.assets.alternatives[${i}]`, 'internal recommendation', `unsupported or mismatched ${alt.name} (${alt.slug})`);
  for (const [i, comparison] of (draft.assets?.comparison || []).entries()) if (allowed.get(comparison.competitorSlug) !== comparison.competitorName) add(product.slug, `${prefix}.assets.comparison[${i}]`, 'comparison', `unsupported or mismatched ${comparison.competitorName} (${comparison.competitorSlug})`);
  findUnexpectedNames(product, { sections: draft.sections, seo: draft.seo, assets: draft.assets }, allowed);
}

for (const item of products) productChecks(item);
for (const state of ['drafts', 'published']) {
  const dir = path.join(root, 'content', state, 'reviews');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.json'))) {
    const draft = read(path.join(dir, file));
    const product = bySlug.get(file.replace(/\.json$/, ''));
    if (!product) add(file.replace(/\.json$/, ''), `${state}:${file}`, 'product name', 'generated review has no canonical product record');
    else draftChecks(product, draft, state, path.join(dir, file));
  }
}

const lines = ['# Review Consistency Report', '', `Generated: ${new Date().toISOString()}`, '', `Products checked: ${products.length}`, `Generated reviews checked: ${['drafts','published'].reduce((n, state) => n + (fs.existsSync(path.join(root,'content',state,'reviews')) ? fs.readdirSync(path.join(root,'content',state,'reviews')).filter(f => f.endsWith('.json')).length : 0), 0)}`, `Mismatches: ${mismatches.length}`, ''];
if (mismatches.length) {
  lines.push('| Product | Type | Field | Mismatch |', '|---|---|---|---|');
  for (const item of mismatches) lines.push(`| ${item.slug} | ${item.type} | \`${item.field}\` | ${item.message.replace(/\|/g, '\\|')} |`);
} else lines.push('No consistency mismatches found.');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
console.log(`Review consistency validation checked ${products.length} products.`);
console.log(`Report: ${path.relative(root, reportPath)}`);
if (mismatches.length) {
  for (const item of mismatches) console.error(`[${item.slug}] ${item.type} ${item.field}: ${item.message}`);
  console.error(`Review consistency validation failed with ${mismatches.length} mismatch(es).`);
  process.exit(1);
}
console.log('No consistency mismatches found.');
