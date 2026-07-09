import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { ProductLogo } from '@/components/ProductLogo';
import { AffiliateButton } from '@/components/affiliate-button';
import { getProducts } from '@/lib/products';
import { findComparisonPair, getComparisonPairs, getPrimaryCategoryHref, getRelatedComparisonProducts, getScorecard, getWinner } from '@/lib/comparisons';
import type { Product } from '@/lib/products';

type Props = { params: Promise<{ comparison: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return getComparisonPairs(products).map((pair) => ({ comparison: pair.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comparison } = await params;
  const products = await getProducts();
  const pair = findComparisonPair(products, comparison);
  if (!pair) return {};
  const title = `${pair.toolA.name} vs ${pair.toolB.name} (2026): Which ${pair.toolA.categoryBadge ?? 'Tool'} Is Better?`;
  const description = `Compare ${pair.toolA.name} and ${pair.toolB.name} on ratings, features, pricing, pros, cons, platforms, and best-fit use cases.`;
  return { title, description, alternates: { canonical: `/compare/${pair.slug}` }, openGraph: { title, description, url: `/compare/${pair.slug}`, type: 'article' }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function ComparisonPage({ params }: Props) {
  const { comparison } = await params;
  const products = await getProducts();
  const pair = findComparisonPair(products, comparison);
  if (!pair) notFound();
  const { toolA, toolB } = pair;
  const winner = getWinner(toolA, toolB);
  const related = getRelatedComparisonProducts(toolA, products, 6).filter((product) => product.slug !== toolB.slug).slice(0, 4);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: `${toolA.name} vs ${toolB.name} (2026)`, description: `A side-by-side comparison of ${toolA.name} and ${toolB.name}.`, mainEntityOfPage: `/compare/${pair.slug}`, about: [toolA.name, toolB.name], itemListElement: [toolA, toolB].map((product, position) => ({ '@type': 'ListItem', position: position + 1, item: { '@type': 'Product', name: product.name, image: product.logo, aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, bestRating: 5, reviewCount: product.reviewCount } } })) };

  return <main className="min-h-screen bg-radial-blue pb-20 text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8 lg:pt-32">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <HeroTool product={toolA} /><div className="text-center text-4xl font-black text-blue-200">VS</div><HeroTool product={toolB} />
      </div>
      <div className="glass mt-10 rounded-[2rem] p-8 text-center"><p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Overall recommendation</p><h1 className="mt-4 text-4xl font-bold sm:text-6xl">{toolA.name} vs {toolB.name} (2026)</h1><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">Choose <strong className="text-white">{winner.name}</strong> for the strongest overall fit based on rating, review volume, feature depth, and product positioning. Compare the details below before committing.</p><div className="mt-8 grid gap-4 md:grid-cols-3"><Mini title="Quick winner" value={winner.name} /><Mini title={`${toolA.name} best for`} value={toolA.bestFor} /><Mini title={`${toolB.name} best for`} value={toolB.bestFor} /></div></div>
    </section>
    <Section eyebrow="Scorecard" title="Side-by-side scorecard"><Scorecard toolA={toolA} toolB={toolB} /></Section>
    <Section eyebrow="Feature comparison" title="Feature-by-feature differences"><FeatureTable toolA={toolA} toolB={toolB} /></Section>
    <Section eyebrow="Pros and cons" title="What each tool gets right"><div className="grid gap-6 lg:grid-cols-2"><ProsCons product={toolA} /><ProsCons product={toolB} /></div></Section>
    <Section eyebrow="Best fit" title="Who should choose each tool"><div className="grid gap-6 lg:grid-cols-2"><Choose product={toolA} /><Choose product={toolB} /></div></Section>
    <Section eyebrow="Pricing" title="Pricing plans side by side"><div className="grid gap-6 lg:grid-cols-2"><Pricing product={toolA} /><Pricing product={toolB} /></div></Section>
    <Section eyebrow="Final verdict" title="Recommendation cards"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Mini title="Best Overall" value={winner.name} /><Mini title="Best Value" value={(toolA.pricing.toLowerCase().includes('free') ? toolA : toolB).name} /><Mini title="Best for Beginners" value={(toolA.tagline.toLowerCase().includes('easy') ? toolA : winner).name} /><Mini title="Best for Business" value={(toolA.categories?.includes('business') ? toolA : toolB).name} /></div></Section>
    <Section eyebrow="Related content" title="Keep comparing"><div className="grid gap-4 md:grid-cols-3"><LinkCard href={`/${toolA.slug}`} title={`${toolA.name} review`} /><LinkCard href={`/${toolB.slug}`} title={`${toolB.name} review`} /><LinkCard href={getPrimaryCategoryHref(toolA)} title="Category page" />{related.map((product) => <LinkCard key={product.slug} href={`/compare/${toolA.slug}-vs-${product.slug}`} title={`${toolA.name} vs ${product.name}`} />)}</div></Section>
  </main>;
}

function HeroTool({ product }: { product: Product }) { return <div className="glass rounded-[2rem] p-8 text-center"><ProductLogo logo={product.logo} name={product.name} size={80} className="mx-auto rounded-2xl" /><h2 className="mt-5 text-3xl font-bold">{product.name}</h2><p className="mt-3 text-slate-300">{product.tagline}</p><AffiliateButton href={product.affiliateLink}>Try {product.name}</AffiliateButton></div>; }
function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">{eyebrow}</p><h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2><div className="mt-10">{children}</div></section>; }
function Mini({ title, value }: { title: string; value: string }) { return <div className="glass rounded-3xl p-6"><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-300">{title}</p><p className="mt-3 text-2xl font-bold text-white">{value}</p></div>; }
function Scorecard({ toolA, toolB }: { toolA: Product; toolB: Product }) { const a = getScorecard(toolA); const b = getScorecard(toolB); return <Table headers={[toolA.name, toolB.name]} rows={a.map((row, index) => [row.label, row.value, b[index].value])} />; }
function FeatureTable({ toolA, toolB }: { toolA: Product; toolB: Product }) { const names = Array.from(new Set([...toolA.features.map((f) => f.title), ...toolB.features.map((f) => f.title)])); return <Table headers={[toolA.name, toolB.name]} rows={names.map((name) => { const a = toolA.features.find((f) => f.title === name); const b = toolB.features.find((f) => f.title === name); return [name, a?.description ?? '—', b?.description ?? '—']; })} />; }
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) { return <div className="overflow-x-auto rounded-3xl border border-white/10"><table className="w-full min-w-[780px] text-left"><thead className="bg-white/10"><tr><th className="p-5">Criteria</th>{headers.map((header) => <th className="p-5" key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-t border-white/10"><th className="p-5 align-top text-white">{row[0]}</th>{row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`} className={`p-5 align-top text-slate-300 ${row[1] !== row[2] ? 'bg-blue-400/5' : ''}`}>{value}</td>)}</tr>)}</tbody></table></div>; }
function ProsCons({ product }: { product: Product }) { return <div className="glass rounded-3xl p-6"><h3 className="text-2xl font-bold">{product.name}</h3><h4 className="mt-6 font-semibold text-emerald-300">Pros</h4><ul className="mt-3 space-y-3">{product.pros.map((item) => <li key={item} className="flex gap-2 text-slate-200"><Check className="h-5 w-5 shrink-0" />{item}</li>)}</ul><h4 className="mt-6 font-semibold text-amber-300">Cons</h4><ul className="mt-3 space-y-3">{product.cons.map((item) => <li key={item} className="text-slate-300">• {item}</li>)}</ul></div>; }
function Choose({ product }: { product: Product }) { return <div className="glass rounded-3xl p-6"><h3 className="text-2xl font-bold">Choose {product.name} if...</h3><ul className="mt-5 space-y-4 text-slate-300">{product.audiences.slice(0, 4).map((item) => <li key={item.title}><strong className="text-white">{item.title}:</strong> {item.description}</li>)}</ul></div>; }
function Pricing({ product }: { product: Product }) { return <div className="space-y-4"><h3 className="text-2xl font-bold">{product.name}</h3>{product.pricingPlans.map((plan) => <div key={plan.name} className="glass rounded-3xl p-6"><p className="text-xl font-bold">{plan.name} <span className="text-blue-200">{plan.price}</span></p><p className="mt-2 text-slate-300">{plan.description}</p></div>)}</div>; }
function LinkCard({ href, title }: { href: string; title: string }) { return <Link href={href} className="glass rounded-3xl p-6 font-semibold transition hover:border-blue-300/40">{title} →</Link>; }
