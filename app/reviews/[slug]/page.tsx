import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPage } from '@/components/landing-page';
import { getProduct, getProductSlugs, getProducts, getRelatedProducts } from '@/lib/products';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const title = product.seoTitle ?? `${product.name} Review: ${product.tagline}`;
  const description = product.metaDescription ?? product.description;
  const image = `/reviews/${product.slug}/opengraph-image`;
  return {
    title,
    description,
    keywords: product.seoKeywords,
    alternates: { canonical: product.canonicalUrl ?? `/reviews/${product.slug}` },
    openGraph: { title, description, url: product.canonicalUrl ?? `/reviews/${product.slug}`, images: [{ url: image, width: 1200, height: 630, alt: `${product.name} review image` }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const products = await getProducts();
  const relatedProducts = getRelatedProducts(product, products);
  return <LandingPage product={product} relatedProducts={relatedProducts} />;
}
