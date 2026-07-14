import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, Star } from 'lucide-react';
import { ProductLogo } from '@/components/ProductLogo';
import { getProductHref, getProducts } from '@/lib/products';
import { normalizeSearchQuery, searchProducts } from '@/lib/search';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `Search results for ${query}` : 'Search AI Tools',
    description: query ? `Find AI tool reviews matching ${query}, including ratings, categories, and review links.` : 'Search published AI tool reviews by name, category, description, features, and tags.',
    alternates: { canonical: query ? `/search?q=${encodeURIComponent(query)}` : '/search' },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const products = await getProducts();
  const query = q.trim();
  const searchableProducts = products.map((product) => ({ ...product, href: getProductHref(product) }));
  const results = searchProducts(searchableProducts, query);
  const suggestions = searchableProducts.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name)).slice(0, 4);

  return (
    <main className="min-h-screen bg-radial-blue text-white">
      <nav className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-lg font-bold text-white">AI Tool Hub</Link>
          <div className="hidden gap-6 text-sm text-slate-300 md:flex"><Link href="/">Home</Link><Link href="/#featured">Features</Link><Link href="/#popular">Compare</Link><Link href="/#categories">Pricing</Link><Link href="/#categories">FAQ</Link></div>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Search results</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{query ? `Results for “${query}”` : 'Search AI tool reviews'}</h1>
        <form action="/search" className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[.08] p-3" role="search">
          <Search className="h-6 w-6 shrink-0 text-blue-300" aria-hidden="true" />
          <input name="q" defaultValue={query} aria-label="Search published AI tool reviews" className="min-w-0 flex-1 bg-transparent text-white placeholder:text-slate-300 focus:outline-none" placeholder="Search by product, category, feature, or tag" type="search" />
          <button className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">Search</button>
        </form>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        {normalizeSearchQuery(query) && results.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <article key={product.slug} className="glass flex h-full flex-col rounded-3xl p-6">
                <div className="flex items-center gap-4"><ProductLogo logo={product.logo} name={product.name} size={56} className="rounded-2xl" /><div><h2 className="text-2xl font-semibold">{product.name}</h2><p className="mt-1 text-sm text-blue-200">{product.categoryBadge ?? product.primaryCategory ?? product.category ?? 'AI Tool'}</p></div></div>
                <p className="mt-5 flex-1 text-slate-300">{product.summary ?? product.description}</p>
                <div className="mt-6 flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-sm text-blue-200"><Star className="h-4 w-4 fill-current" />{product.rating}/5</span><Link href={getProductHref(product)} className="font-semibold text-blue-200 hover:text-white">Read review →</Link></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8">
            <h2 className="text-2xl font-bold">No results found{query ? ` for “${query}”` : ''}.</h2>
            <p className="mt-3 text-slate-300">Try a broader product name, category, feature, or tag such as “writing,” “marketing,” “coding,” or “productivity.”</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((product) => <Link key={product.slug} href={getProductHref(product)} className="rounded-2xl border border-white/10 bg-white/[.05] p-4 hover:border-blue-300/60"><ProductLogo logo={product.logo} name={product.name} size={40} className="rounded-xl" /><p className="mt-3 font-semibold">{product.name}</p><p className="mt-1 text-sm text-slate-300">{product.categoryBadge ?? product.primaryCategory ?? 'AI Tool'}</p></Link>)}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
