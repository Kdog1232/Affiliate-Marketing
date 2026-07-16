const fs = require('fs');
const path = require('path');

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aitoolbet.com').replace(/\/$/, '');
const productsDir = path.join(process.cwd(), 'products');
const pricePattern = /^\d+(?:\.\d{1,2})?$/;
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`Structured data error: ${message}`);
}

function canonicalUrl(pathOrUrl) {
  try {
    const url = new URL(pathOrUrl);
    url.protocol = 'https:';
    return url.toString();
  } catch {
    return `${siteUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
  }
}

function normalizeOfferPrice(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (/free|custom|contact|check|trial|\/|month|year|annual|one-time|starts|from|\$|usd|[a-z]/i.test(trimmed)) return null;
  const numeric = trimmed.replace(/,/g, '');
  return pricePattern.test(numeric) ? numeric : null;
}

function validateOffer(offer, context) {
  if (!offer) return;
  if (offer['@type'] !== 'Offer') fail(`${context} offer is missing @type Offer`);
  if (typeof offer.price !== 'string' || !pricePattern.test(offer.price)) fail(`${context} offer price must be a numeric string`);
  if (offer.priceCurrency !== 'USD') fail(`${context} offer priceCurrency must be USD`);
  if (!offer.url) fail(`${context} offer url is required when an offer is emitted`);
}

function validateBreadcrumb(schema, context) {
  for (const item of schema.itemListElement || []) {
    const id = item.item && item.item['@id'];
    if (!id || !/^https:\/\//.test(id)) fail(`${context} breadcrumb item ${item.position} must use a fully-qualified HTTPS item.@id`);
  }
}

function buildSchemas(product) {
  const pageUrl = canonicalUrl(product.canonicalUrl || `/${product.slug}`);
  const validPlan = (product.pricingPlans || []).map((plan) => normalizeOfferPrice(plan.price)).find(Boolean);
  const offer = validPlan ? { '@type': 'Offer', url: product.affiliateLink, price: validPlan, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } : null;
  const software = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: product.name };
  if (offer) software.offers = offer;
  return [
    { '@context': 'https://schema.org', '@type': 'Review', itemReviewed: { '@type': 'SoftwareApplication', name: product.name } },
    software,
    { '@context': 'https://schema.org', '@type': 'Article', mainEntityOfPage: pageUrl },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: { '@id': canonicalUrl('/'), name: 'Home' } }, { '@type': 'ListItem', position: 2, name: product.name, item: { '@id': pageUrl, name: product.name } }] },
  ];
}

for (const file of fs.readdirSync(productsDir).filter((name) => name.endsWith('.json'))) {
  const product = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf8'));
  const schemas = buildSchemas(product);
  if (schemas.some((schema) => schema['@type'] === 'Product')) fail(`${file} emits Product schema for an affiliate review page`);
  for (const schema of schemas) {
    if (schema['@context'] !== 'https://schema.org') fail(`${file} ${schema['@type']} must use Schema.org context`);
    if (schema['@type'] === 'BreadcrumbList') validateBreadcrumb(schema, file);
    if (schema.offers) validateOffer(schema.offers, `${file} ${schema['@type']}`);
    if (schema.itemReviewed && schema.itemReviewed['@type'] === 'Product') fail(`${file} Review itemReviewed must not be Product for AI software reviews`);
  }
}

if (failures > 0) process.exit(1);
console.log('Structured data validation passed.');
