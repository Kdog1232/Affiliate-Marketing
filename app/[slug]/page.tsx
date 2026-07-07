import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPage } from '@/components/landing-page';
import { getProduct, getProductSlugs } from '@/lib/products';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const title = `${product.name} Review: ${product.tagline}`;
  const image = `/${product.slug}/opengraph-image`;
  return {
    title,
    description: product.description,
    alternates: { canonical: product.canonicalUrl ?? `/${product.slug}` },
    openGraph: { title, description: product.description, url: product.canonicalUrl ?? `/${product.slug}`, images: [{ url: image, width: 1200, height: 630, alt: `${product.name} review image` }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description: product.description, images: [image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <LandingPage product={product} />;
}
