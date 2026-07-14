export const affiliateLinks = {
  'copybase-ai': 'https://3b5ebwxlxlu3sr1otcz-zysejv.hop.clickbank.net',
} as const;

export type AffiliateSlug = keyof typeof affiliateLinks;

export function getAffiliateDestination(slug: string) {
  return affiliateLinks[slug as AffiliateSlug] ?? null;
}
