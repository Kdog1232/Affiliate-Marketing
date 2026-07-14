export const affiliateLinks = {
  'copybase-ai': 'https://3b5ebwxlxlu3sr1otcz-zysejv.hop.clickbank.net',
  bluefx: 'https://b1b3d-rl0bvxrg53xikb2yay3q.hop.clickbank.net',
} as const;

export type AffiliateSlug = keyof typeof affiliateLinks;

export function getAffiliateDestination(slug: string) {
  return affiliateLinks[slug as AffiliateSlug] ?? null;
}
