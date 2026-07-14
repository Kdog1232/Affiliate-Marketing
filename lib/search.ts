export type SearchFeature = {
  title: string;
  description?: string;
  whatItDoes?: string;
  whyItMatters?: string;
};

export type SearchableProduct = {
  slug: string;
  name: string;
  description: string;
  summary?: string;
  category?: string;
  categoryBadge?: string;
  primaryCategory?: string;
  secondaryCategories?: string[];
  categories?: string[];
  tags?: string[];
  features?: SearchFeature[];
  keyFeatures?: SearchFeature[];
  logo: string;
  rating: number;
  href: string;
};

export function toSearchableProduct<T extends SearchableProduct>(product: T): SearchableProduct {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    summary: product.summary,
    category: product.category,
    categoryBadge: product.categoryBadge,
    primaryCategory: product.primaryCategory,
    secondaryCategories: product.secondaryCategories,
    categories: product.categories,
    tags: product.tags,
    features: product.features,
    keyFeatures: product.keyFeatures,
    logo: product.logo,
    rating: product.rating,
    href: product.href,
  };
}

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

function productCategoryTerms(product: SearchableProduct) {
  return [
    product.category,
    product.categoryBadge,
    product.primaryCategory,
    ...(product.secondaryCategories ?? []),
    ...(product.categories ?? []),
  ];
}

export function productSearchText(product: SearchableProduct) {
  return [
    product.name,
    ...productCategoryTerms(product),
    product.description,
    product.summary,
    ...(product.tags ?? []),
    ...((product.features ?? []).flatMap((feature) => [feature.title, feature.description, feature.whatItDoes, feature.whyItMatters]) ?? []),
    ...((product.keyFeatures ?? []).flatMap((feature) => [feature.title, feature.description, feature.whatItDoes, feature.whyItMatters]) ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function findExactProductMatch<T extends SearchableProduct>(products: T[], query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return null;
  return products.find((product) => product.name.toLowerCase() === normalized || product.slug.toLowerCase() === normalized) ?? null;
}

export function searchProducts<T extends SearchableProduct>(products: T[], query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];

  return products
    .map((product) => {
      const name = product.name.toLowerCase();
      const searchText = productSearchText(product);
      const score = name === normalized ? 100 : name.startsWith(normalized) ? 80 : name.includes(normalized) ? 60 : searchText.includes(normalized) ? 30 : 0;
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || a.product.name.localeCompare(b.product.name))
    .map((item) => item.product);
}
