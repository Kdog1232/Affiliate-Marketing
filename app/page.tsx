import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search, Star, TrendingUp } from 'lucide-react';
import { CATEGORIES, getCategoryHref, getProductHref, getProducts, type Product } from '@/lib/products';
import { ProductLogo } from '@/components/ProductLogo';

export const metadata: Metadata = {
  title: 'Discover the Best AI Tools',
  description: 'Find the right AI software for teachers, businesses, creators, developers, marketers, and entrepreneurs.',
};

export default async function Home() {
  const products = await getProducts();
  const newest = [...products].sort((a, b) => Date.parse(b.review.datePublished) - Date.parse(a.review.datePublished)).slice(0, 6);
  const popular = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);
  const featured = products.slice(0, 6);

  return <main className="min-h-screen bg-radial-blue">
    <SiteNav />
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-32 text-center lg:px-8 lg:pt-40">
      <p className="text-sm font-semibold uppercase tracking-[.35em] text-blue-300">AI software directory</p>
      <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-bold tracking-tight text-white sm:text-7xl">Discover the Best AI Tools</h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">Find the right AI software for teachers, businesses, creators, developers, marketers, and entrepreneurs.</p>
      <div className="mx-auto mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[.08] p-3 text-left shadow-2xl shadow-black/20">
        <Search className="h-6 w-6 shrink-0 text-blue-300" aria-hidden="true" />
        <span className="flex-1 text-slate-300">Search AI Tools</span>
        <a href="#featured" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">Search</a>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {['Browse Categories','Featured Tools','Newest Reviews','Most Popular','AI for Teachers','AI for Business','AI Coding','AI Marketing','AI Productivity'].map((item) => <a key={item} href={item === 'Browse Categories' ? '#categories' : '#featured'} className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-sm text-slate-200 hover:border-blue-300/60 hover:text-white">{item}</a>)}
      </div>
    </section>
    <ProductSection id="featured" eyebrow="Featured Tools" title="Start with these popular AI products" products={featured} />
    <ProductSection id="newest" eyebrow="Newest Reviews" title="Latest AI software reviews" products={newest} />
    <ProductSection id="popular" eyebrow="Most Popular" title="Most visited tools in the directory" products={popular} />
    <section id="categories" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Browse Categories</p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Find AI tools by use case</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => <Link key={category.slug} href={getCategoryHref(category)} className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:border-blue-300/60"><p className="text-xl font-semibold text-white">{category.name}</p><p className="mt-3 text-sm text-slate-300">Compare tools for {category.name.toLowerCase()} workflows.</p><ArrowRight className="mt-6 h-5 w-5 text-blue-300" /></Link>)}
      </div>
    </section>
  </main>;
}

function SiteNav() { return <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"><Link href="/" className="text-lg font-bold text-white">AI Tool Hub</Link><div className="hidden gap-6 text-sm text-slate-300 md:flex"><a href="#featured">Featured Tools</a><a href="#newest">Newest Reviews</a><a href="#popular">Most Popular</a><a href="#categories">Categories</a></div></div></nav>; }

function ProductSection({ id, eyebrow, title, products }: { id: string; eyebrow: string; title: string; products: Product[] }) { return <section id={id} className="mx-auto max-w-7xl px-6 py-16 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">{eyebrow}</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2></div><Link href="#categories" className="text-sm font-semibold text-blue-200 hover:text-white">Browse Categories →</Link></div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div></section>; }

function ProductCard({ product }: { product: Product }) { return <Link href={getProductHref(product)} className="glass group flex h-full flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:border-blue-300/60"><div className="flex items-center gap-4"><ProductLogo logo={product.logo} name={product.name} size={56} className="rounded-2xl" /><div><h3 className="text-2xl font-semibold text-white">{product.name}</h3><div className="mt-1 flex items-center gap-2 text-sm text-blue-200"><Star className="h-4 w-4 fill-current" />{product.rating}/5 · {product.reviewCount} reviews</div></div></div><p className="mt-5 flex-1 text-slate-300">{product.description}</p><div className="mt-6 flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-100"><TrendingUp className="h-4 w-4" />{product.bestFor}</span><span className="font-semibold text-blue-200 group-hover:text-white">Read Review →</span></div></Link>; }
