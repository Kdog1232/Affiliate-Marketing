export const affiliateLinks = {
  'copybase-ai': {
    name: 'CopyBase AI',
    affiliateUrl: 'https://3b5ebwxlxlu3sr1otcz-zysejv.hop.clickbank.net',
  },
  bluefx: {
    name: 'BlueFX',
    affiliateUrl: 'https://b1b3d-rl0bvxrg53xikb2yay3q.hop.clickbank.net',
  },
  shopify: {
    name: 'Shopify',
    affiliateUrl: 'https://shopify.pxf.io/c/7482839/1061744/13624',
  },
} as const;

export type AffiliateSlug = keyof typeof affiliateLinks;

export function getAffiliateDestination(slug: string) {
  return affiliateLinks[slug as AffiliateSlug]?.affiliateUrl ?? null;
}
