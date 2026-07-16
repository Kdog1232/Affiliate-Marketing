import { getProductHref, type Product } from '@/lib/products';

const DEFAULT_SITE_URL = 'https://aitoolbet.com';
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function canonicalUrl(pathOrUrl: string, siteUrl = getSiteUrl()) {
  try {
    const url = new URL(pathOrUrl);
    url.protocol = 'https:';
    return url.toString();
  } catch {
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${siteUrl}${path}`;
  }
}

export function breadcrumbItem(position: number, name: string, url: string) {
  const id = canonicalUrl(url);
  return { '@type': 'ListItem', position, name, item: { '@id': id, name } };
}

export function normalizeOfferPrice(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (/free|custom|contact|check|trial|\/|month|year|annual|one-time|starts|from|\$|usd|[a-z]/i.test(trimmed)) return null;
  const numeric = trimmed.replace(/,/g, '');
  return PRICE_PATTERN.test(numeric) ? numeric : null;
}

export function buildOffer(price?: string, url?: string) {
  const normalizedPrice = normalizeOfferPrice(price);
  if (!normalizedPrice || !url) return null;
  return { '@type': 'Offer', url, price: normalizedPrice, priceCurrency: 'USD', availability: 'https://schema.org/InStock' };
}

export function firstValidOffer(product: Product) {
  for (const plan of product.pricingPlans ?? []) {
    const offer = buildOffer(plan.price, product.affiliateLink);
    if (offer) return offer;
  }
  if (typeof product.pricing === 'object') return buildOffer(product.pricing.startingPrice, product.affiliateLink);
  return null;
}

export function buildProductReviewJsonLd(product: Product) {
  const pageUrl = canonicalUrl(product.canonicalUrl ?? getProductHref(product));
  const offer = firstValidOffer(product);
  const softwareApplication: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    url: pageUrl,
    image: canonicalUrl(product.heroImage),
    applicationCategory: product.categoryBadge ?? product.primaryCategory ?? 'BusinessApplication',
    operatingSystem: product.platforms.join(', '),
    description: product.description,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: String(product.rating), bestRating: '5', reviewCount: String(product.reviewCount) },
  };
  if (offer) softwareApplication.offers = offer;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Review',
      mainEntityOfPage: pageUrl,
      itemReviewed: { '@type': 'SoftwareApplication', name: product.name, url: pageUrl, image: canonicalUrl(product.heroImage), description: product.description },
      author: { '@type': 'Organization', name: product.review.author },
      publisher: { '@type': 'Organization', name: 'AIToolBet', url: getSiteUrl() },
      datePublished: product.review.datePublished,
      name: product.review.title,
      reviewBody: product.review.summary,
      reviewRating: { '@type': 'Rating', ratingValue: String(product.rating), bestRating: '5' },
    },
    softwareApplication,
    { '@context': 'https://schema.org', '@type': 'Article', headline: product.review.title, description: product.description, author: { '@type': 'Organization', name: product.review.author }, publisher: { '@type': 'Organization', name: 'AIToolBet', url: getSiteUrl() }, datePublished: product.review.datePublished, mainEntityOfPage: pageUrl, about: product.name },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [breadcrumbItem(1, 'Home', '/'), breadcrumbItem(2, product.name, pageUrl)] },
  ];
}
