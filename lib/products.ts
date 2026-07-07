import { promises as fs } from 'fs';
import path from 'path';

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  heroImage: string;
  affiliateLink: string;
  rating: number;
  reviewCount: number;
  setupTime: string;
  bestFor: string;
  users: string;
  platforms: string[];
  pricing: string;
  canonicalUrl?: string;
  features: { icon: string; title: string; description: string }[];
  howItWorks: { title: string; description: string }[];
  pros: string[];
  cons: string[];
  pricingPlans: { name: string; price: string; description: string; features: string[]; cta: string }[];
  audiences: { title: string; description: string }[];
  testimonials: { quote: string; author: string; role: string }[];
  socialProof: { metric: string; label: string; description: string }[];
  comparison: { feature: string; product: string; competitors: string; winner: string }[];
  whyTrust: { title: string; description: string }[];
  notFor: { title: string; description: string }[];
  review: { author: string; title: string; summary: string; datePublished: string };
  faq: { question: string; answer: string }[];
};

const productsDirectory = path.join(process.cwd(), 'products');

export async function getProductSlugs() {
  const files = await fs.readdir(productsDirectory);
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/, ''));
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const file = await fs.readFile(path.join(productsDirectory, `${slug}.json`), 'utf8');
    return JSON.parse(file) as Product;
  } catch {
    return null;
  }
}

export async function getProducts() {
  const slugs = await getProductSlugs();
  return Promise.all(slugs.map(async (slug) => getProduct(slug))).then((items) => items.filter(Boolean) as Product[]);
}
