import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, Star, Table2 } from 'lucide-react';
import { CategoryNav } from '@/components/category-nav';
import { ProductLogo } from '@/components/ProductLogo';
import { CATEGORIES, getCategoryByPathSlug, getCategoryHref, getCategoryPathSlug, getProductsByCategory, sortProducts, type Product } from '@/lib/products';

type Props = { params: Promise<{ category: string }>; searchParams?: Promise<{ sort?: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: getCategoryPathSlug(category) }));
}

async function getCategoryData(pathSlug: string) {
  const category = getCategoryByPathSlug(pathSlug);
  if (!category) return null;
  const products = await getProductsByCategory(category.slug);
  return { category, products };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: pathSlug } = await params;
  const data = await getCategoryData(pathSlug);
  if (!data) return {};
  const { category, products } = data;
  return {
    title: `Best ${category.name} Tools (${products.length} Reviewed)`,
    description: `Compare ${products.length} ${category.name.toLowerCase()} tools with ratings, pricing, use cases, buying advice, FAQs, and links to full reviews.`,
    alternates: { canonical: getCategoryHref(category) },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: pathSlug } = await params;
  const sort = (await searchParams)?.sort ?? 'rating';
  const data = await getCategoryData(pathSlug);
  if (!data) notFound();
  const { category } = data;
  const products = sortProducts(data.products, sort);
  const topProduct = products[0];
  const title = `Best ${category.name} Tools`;
  const intro = `Compare ${products.length} ${category.name.toLowerCase()} tools for ${category.intent ?? `${category.name.toLowerCase()} workflows`}. This page updates automatically from the product taxonomy whenever reviews are added or recategorized.`;
  const schema = buildSchema(category.name, getCategoryHref(category), products);

  return <main className="min-h-screen bg-radial-blue px-6 py-10 lg:px-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[.05] p-5 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="text-lg font-bold text-white">AI Tool Hub</Link>
        <CategoryNav compact />
      </div>

      <nav aria-label="Breadcrumb" className="mt-10 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        <Link href="/" className="hover:text-white">Home</Link><ChevronRight className="h-4 w-4" />
        <Link href="/#categories" className="hover:text-white">Categories</Link><ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-blue-200">{category.name}</span>
      </nav>

      <section className="py-12">
        <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Category guide</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{intro}</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
          <span className="rounded-full bg-blue-500/20 px-4 py-2 font-semibold text-blue-100">{products.length} reviews</span>
          {topProduct && <span className="rounded-full bg-white/[.08] px-4 py-2">Top rated: {topProduct.name}</span>}
          <span className="rounded-full bg-white/[.08] px-4 py-2">Server-rendered comparison</span>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-bold text-white">Sortable review cards</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              {[['rating','Top rated'], ['reviews','Most reviewed'], ['newest','Newest'], ['name','A-Z']].map(([key, label]) => <Link key={key} href={`${getCategoryHref(category)}?sort=${key}`} className={`rounded-full px-3 py-2 ${sort === key ? 'bg-blue-500 text-white' : 'bg-white/[.08] text-slate-200 hover:text-white'}`}>{label}</Link>)}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {products.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[.06] p-6">
          <h2 className="text-2xl font-bold text-white">Buying guide</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>Start with the workflow you need to improve, then shortlist tools that match that primary use case.</li>
            <li>Compare rating, review volume, pricing model, setup time, supported platforms, and best-fit audience.</li>
            <li>Open the full reviews before buying so you can review pros, cons, pricing details, and alternatives.</li>
          </ul>
        </aside>
      </section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[.05] p-6">
        <h2 className="flex items-center gap-2 text-3xl font-bold text-white"><Table2 className="h-7 w-7 text-blue-300" />Comparison table</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-blue-200"><tr><th className="py-3 pr-4">Tool</th><th className="py-3 pr-4">Rating</th><th className="py-3 pr-4">Reviews</th><th className="py-3 pr-4">Best for</th><th className="py-3 pr-4">Pricing</th><th className="py-3 pr-4">Review</th></tr></thead>
            <tbody className="divide-y divide-white/10 text-slate-300">{products.map((product) => <tr key={product.slug}><td className="py-4 pr-4 font-semibold text-white">{product.name}</td><td className="py-4 pr-4">{product.rating}/5</td><td className="py-4 pr-4">{product.reviewCount.toLocaleString()}</td><td className="py-4 pr-4">{product.bestFor}</td><td className="py-4 pr-4">{product.pricing}</td><td className="py-4 pr-4"><Link href={`/${product.slug}`} className="font-semibold text-blue-200 hover:text-white">Read review</Link></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <Info title="How we evaluate tools" items={[`Hands-on review data is pulled from each product profile in the taxonomy.`, `We prioritize fit for ${category.name.toLowerCase()}, review quality, transparent pricing, practical use cases, and meaningful limitations.`, `Category pages refresh automatically as product JSON files are added or updated.`]} />
        <Info title={`${category.name} FAQs`} items={[`What is the best ${category.name.toLowerCase()} tool? ${topProduct ? `${topProduct.name} is currently the top-rated option in this category, but the best choice depends on your workflow.` : 'The best choice depends on your workflow.'}`, `How many ${category.name.toLowerCase()} tools are reviewed? This category currently includes ${products.length} product review${products.length === 1 ? '' : 's'}.`, `Are these product lists hardcoded? No. Pages are generated from product taxonomy fields and update when products change.`]} />
      </section>
    </div>
  </main>;
}

function ProductCard({ product }: { product: Product }) {
  return <Link href={`/${product.slug}`} className="glass group flex h-full flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:border-blue-300/60"><div className="flex items-center gap-4"><ProductLogo logo={product.logo} name={product.name} size={56} className="rounded-2xl" /><div><h3 className="text-2xl font-semibold text-white">{product.name}</h3><p className="mt-1 flex items-center gap-2 text-sm text-blue-200"><Star className="h-4 w-4 fill-current" />{product.rating}/5 · {product.reviewCount.toLocaleString()} reviews</p></div></div><p className="mt-5 flex-1 text-slate-300">{product.description}</p><p className="mt-5 text-sm text-slate-300"><strong className="text-white">Best for:</strong> {product.bestFor}</p><span className="mt-6 inline-flex items-center font-semibold text-blue-200 group-hover:text-white">Read full review <ArrowRight className="ml-2 h-4 w-4" /></span></Link>;
}

function Info({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-3xl border border-white/10 bg-white/[.06] p-6"><h2 className="text-3xl font-bold text-white">{title}</h2><div className="mt-5 space-y-4 text-slate-300">{items.map((item) => <p key={item}>{item}</p>)}</div></section>;
}

function buildSchema(categoryName: string, href: string, products: Product[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Best ${categoryName} Tools`,
    url: `${siteUrl}${href}`,
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Categories', item: `${siteUrl}/#categories` }, { '@type': 'ListItem', position: 3, name: categoryName, item: `${siteUrl}${href}` }] },
    mainEntity: { '@type': 'ItemList', numberOfItems: products.length, itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, url: `${siteUrl}/${product.slug}`, name: product.name })) },
  };
}
