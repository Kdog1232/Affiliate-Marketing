import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { CATEGORIES, getCategory, getProductsByCategory } from '@/lib/products';

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) return {};
  return {
    title: `Best AI Tools for ${category.name}`,
    description: `Compare AI software for ${category.name.toLowerCase()} workflows, reviews, pricing, and use cases.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();
  const products = await getProductsByCategory(category.slug);

  return <main className="min-h-screen bg-radial-blue px-6 py-16 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to AI Tool Hub</Link>
      <p className="mt-12 text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Browse Categories</p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">Best AI Tools for {category.name}</h1>
      <p className="mt-6 max-w-3xl text-lg text-slate-300">Compare matching AI software reviews and choose the right product for your {category.name.toLowerCase()} workflow.</p>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <Link key={product.slug} href={`/${product.slug}`} className="glass group rounded-3xl p-6 transition hover:-translate-y-1 hover:border-blue-300/60"><div className="flex items-center gap-4"><Image src={product.logo} alt={`${product.name} logo`} width={56} height={56} className="rounded-2xl" /><div><h2 className="text-2xl font-semibold text-white">{product.name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-blue-200"><Star className="h-4 w-4 fill-current" />{product.rating}/5 · {product.reviewCount} reviews</p></div></div><p className="mt-5 text-slate-300">{product.description}</p><p className="mt-6 font-semibold text-blue-200 group-hover:text-white">Read Review →</p></Link>)}
      </div>
    </div>
  </main>;
}
