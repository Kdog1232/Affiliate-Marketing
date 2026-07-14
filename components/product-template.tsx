import Link from 'next/link';
import { AlertTriangle, Bot, Brain, ChartBar, Check, ChevronDown, Code, FileText, FolderKanban, Image as ImageIcon, MessageCircle, Mic, Plug, Search, Star, Upload, XCircle } from 'lucide-react';
import type { Product } from '@/lib/products';
import { getComparisonSlug, getPricingText } from '@/lib/comparisons';
import { AffiliateButton } from './affiliate-button';
import { FloatingCta } from './floating-cta';
import { ProductLogo } from './ProductLogo';
import { ScreenshotImage } from './ScreenshotImage';

const icons = { MessageCircle, Code, FileText, Image: ImageIcon, Mic, Search, Bot, Upload, ChartBar, Plug, Brain, FolderKanban };

type NamedItem = { title: string; description: string };
type ExpandedFeature = { title: string; description?: string; whatItDoes?: string; whyItMatters?: string; whoBenefits?: string | string[]; bestFor?: string[]; example?: string; tradeoff?: string; recommendedWorkflow?: string; icon?: string };
type ExpandedUseCase = { title: string; scenario: string; problem: string; solution: string; outcome: string };
type Alternative = { name: string; slug?: string; logo?: string; description: string };
type ComparisonMatrix = { columns: string[]; rows: { feature: string; values: string[] }[] };
function bestForText(product: Product) { return Array.isArray(product.bestFor) ? product.bestFor.join(', ') : product.bestFor; }
function sentence(value: string) { return value.trim().replace(/[.!?]?$/, '.'); }
function asTextList(value?: string | string[]) { if (!value) return ''; return Array.isArray(value) ? value.join(', ') : value; }
function editorialFeatures(product: Product): ExpandedFeature[] {
  const graph = product.knowledgeGraph?.facts.features ?? [];
  const base = product.features;
  return base.map((feature) => {
    const graphFeature = graph.find((item) => item.name.toLowerCase() === feature.title.toLowerCase());
    const example = graphFeature?.example ?? feature.example;
    return {
      ...feature,
      title: feature.title,
      description: feature.description,
      whatItDoes: graphFeature?.whatItDoes ?? feature.whatItDoes ?? feature.description,
      whyItMatters: graphFeature?.whyItMatters ?? feature.whyItMatters,
      whoBenefits: graphFeature?.bestFor ?? feature.whoBenefits,
      example,
      tradeoff: graphFeature?.tradeoff ?? feature.tradeoff,
      recommendedWorkflow: graphFeature?.recommendedWorkflow ?? feature.recommendedWorkflow ?? (example ? `Start with a real work packet, ask ${product.name} for a first-pass read, then verify the output before it becomes client, legal, financial, or production material.` : undefined),
    };
  });
}
function editorialUseCases(product: Product): ExpandedUseCase[] {
  const graphCases = product.knowledgeGraph?.facts.useCases ?? [];
  if (graphCases.length > 0) {
    return graphCases.map((item) => ({
      title: item.title,
      scenario: item.industry ? `${item.industry} team handling ${item.title.toLowerCase()}.` : `Team handling ${item.title.toLowerCase()}.`,
      problem: item.difficulty ? `The work is ${item.difficulty.toLowerCase()} enough that a shallow prompt can miss context, risks, or the next practical step.` : 'The work requires turning messy inputs into a decision-ready starting point.',
      solution: item.workflow,
      outcome: item.timeSaved ? `Expected outcome: ${sentence(item.timeSaved)} The human reviewer can spend more time judging the result instead of assembling the first pass.` : 'Expected outcome: a clearer first draft, review checklist, or analyst outline that still receives human review before use.',
    }));
  }
  return (product.useCases ?? []).map((item) => ({ title: item, scenario: item, problem: 'The starting material is scattered, incomplete, or too time-consuming to organize manually.', solution: sentence(item), outcome: 'Expected outcome: a more structured working draft that a subject-matter expert can refine.' }));
}

export function ProductTemplate({ product, relatedProducts }: { product: Product; relatedProducts?: Product[] }) {
  const quickFacts = product.quickFacts ?? [
    { label: 'Setup Time', value: product.setupTime },
    { label: 'Pricing', value: getPricingText(product) },
    { label: 'Platforms', value: product.platforms.join(', ') },
    { label: 'Best For', value: bestForText(product) },
    { label: 'Overall Rating', value: `${product.rating} / 5` },
  ];
  const productSchema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.heroImage, brand: { '@type': 'Brand', name: product.name }, aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, bestRating: 5, reviewCount: product.reviewCount }, review: { '@type': 'Review', author: { '@type': 'Organization', name: product.review.author }, datePublished: product.review.datePublished, name: product.review.title, reviewBody: product.review.summary, reviewRating: { '@type': 'Rating', ratingValue: product.rating, bestRating: 5 } }, offers: { '@type': 'Offer', url: product.affiliateLink, price: getPricingText(product), availability: 'https://schema.org/InStock' } };
  const reviewSchema = { '@context': 'https://schema.org', '@type': 'Review', itemReviewed: { '@type': 'Product', name: product.name, image: product.heroImage, description: product.description }, author: { '@type': 'Organization', name: product.review.author }, datePublished: product.review.datePublished, name: product.review.title, reviewBody: product.review.summary, reviewRating: { '@type': 'Rating', ratingValue: product.rating, bestRating: 5 } };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
  const softwareSchema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: product.name, applicationCategory: product.category ?? product.categoryBadge ?? 'BusinessApplication', operatingSystem: product.platforms.join(', '), description: product.description, image: product.heroImage, offers: { '@type': 'Offer', url: product.affiliateLink, price: getPricingText(product) }, aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, bestRating: 5, reviewCount: product.reviewCount } };
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: '/' }, { '@type': 'ListItem', position: 2, name: product.name, item: product.canonicalUrl ?? `/${product.slug}` }] };

  return <main className="min-h-screen overflow-hidden bg-radial-blue pb-20 md:pb-0">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <Navbar product={product} />
    <Hero product={product} />
    <AffiliateDisclosure />
    <Section id="quick-facts" eyebrow="Quick facts" title={`${product.name} at a glance`}><FactGrid items={quickFacts} /></Section>
    <Section id="overview" eyebrow="Overview" title={`What is ${product.name}?`}><div className="grid gap-8 lg:grid-cols-[1fr_360px]"><div className="space-y-5 text-lg leading-8 text-slate-300">{(product.overview ?? [product.description]).map((p) => <p key={p}>{p}</p>)}</div><VerdictMini product={product} /></div></Section>
    <ScreenshotGallery product={product} />
    <Section id="features" eyebrow="Features" title="How the key features work in practice"><div className="grid gap-5 lg:grid-cols-2">{editorialFeatures(product).map((feature) => { const Icon = icons[feature.icon as keyof typeof icons] ?? Bot; return <Card key={feature.title}><Icon className="mb-5 h-6 w-6 text-blue-300" /><h3 className="text-2xl font-semibold text-white">{feature.title}</h3><FeatureDetail label="What it does" value={feature.whatItDoes ?? feature.description} /><FeatureDetail label="Why it matters" value={feature.whyItMatters} /><FeatureDetail label="Who benefits most" value={asTextList(feature.whoBenefits)} /><FeatureDetail label="Real-world example" value={feature.example} /><FeatureDetail label="Tradeoff or limitation" value={feature.tradeoff} /><FeatureDetail label="Recommended workflow" value={feature.recommendedWorkflow} /></Card>; })}</div><CenterCta href={product.affiliateLink}>Try {product.name} after comparing features</CenterCta></Section>
    <Section eyebrow="Pros & Cons" title={`A balanced ${product.name} review`}><div className="grid gap-6 lg:grid-cols-2"><ListCard title="Pros" items={product.pros} tone="pro" /><ListCard title="Cons" items={product.cons} tone="con" /></div></Section>
    <Section id="pricing" eyebrow="Pricing" title={`${product.name} pricing plans`}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{product.pricingPlans.map((plan) => <Card key={plan.name}><h3 className="text-2xl font-semibold">{plan.name}</h3><p className="mt-2 text-3xl font-bold text-white">{plan.price}</p><p className="mt-3 text-sm text-slate-300">{plan.description}</p><ul className="my-6 space-y-3">{plan.features.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-200"><Check className="h-5 w-5 shrink-0 text-blue-300" />{item}</li>)}</ul><AffiliateButton href={product.affiliateLink}>{plan.cta}</AffiliateButton></Card>)}</div></Section>
    <Section eyebrow="Best fit" title={`Who should use ${product.name}`}><CardGrid items={product.audiences} /></Section>
    <Section eyebrow="Not a fit" title={`Who should skip ${product.name}`}><CardGrid items={product.notFor} warning /></Section>
    <Section eyebrow="Use cases" title={`Real-world ways to use ${product.name}`}><div className="grid gap-5 lg:grid-cols-2">{editorialUseCases(product).map((item) => <Card key={item.title}><SparkLabel>{item.title}</SparkLabel><UseCaseDetail label="Scenario" value={item.scenario} /><UseCaseDetail label="Problem" value={item.problem} /><UseCaseDetail label={`How ${product.name} solves it`} value={item.solution} /><UseCaseDetail label="Expected outcome" value={item.outcome} /></Card>)}</div></Section>
    <Section id="alternatives" eyebrow="Alternatives" title={`${product.name} alternatives to compare`}><Alternatives items={product.alternatives ?? []} /></Section>
    <Section id="comparison" eyebrow="Comparison" title={`${product.name} comparison table`}><Comparison matrix={product.comparisonMatrix} productName={product.name} /></Section>
    <Section id="faq" eyebrow="FAQ" title="Frequently asked questions"><div className="mx-auto max-w-3xl space-y-3">{product.faq.map((item) => <details key={item.question} className="glass group rounded-2xl p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">{item.question}<ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" /></summary><p className="mt-4 text-slate-300">{item.answer}</p></details>)}</div></Section>
    <Section eyebrow="Final verdict" title={`Should you use ${product.name} in 2026?`}><Verdict product={product} /></Section>
    <CompareWith product={product} relatedProducts={relatedProducts ?? []} />
    <RelatedReviews product={product} relatedProducts={relatedProducts ?? []} />
    <Footer product={product} />
    <FloatingCta href={product.affiliateLink} productName={product.name} />
  </main>;
}

function Navbar({ product }: { product: Product }) { return <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"><Link href={`/${product.slug}`} className="flex items-center gap-3 font-semibold"><ProductLogo logo={product.logo} name={product.name} size={32} className="rounded-lg" />{product.name}</Link><div className="hidden gap-6 text-sm text-slate-300 md:flex"><a href="#features">Features</a><a href="#comparison">Compare</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><AffiliateButton href={product.affiliateLink}>Try Now</AffiliateButton></div></nav>; }
function Hero({ product }: { product: Product }) { return <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-32 lg:grid-cols-2 lg:px-8 lg:pt-40"><div><div className="mb-6 inline-flex items-center gap-3 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200"><ProductLogo logo={product.logo} name={product.name} size={24} className="rounded-md" />{product.categoryBadge ?? 'AI Assistant'}</div><h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">{product.review.title}</h1><p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">{product.tagline}.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><AffiliateButton href={product.affiliateLink}>Try {product.name}</AffiliateButton><a href="#overview" className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white transition hover:border-blue-300/50">Read Full Review</a></div></div><div className="glass rounded-[2rem] p-3 shadow-2xl shadow-blue-950/40"><ScreenshotImage src={product.heroImage} alt={`${product.name} application screenshot`} width={1600} height={1000} className="rounded-[1.5rem] border border-white/10" priority /></div></section>; }
function ScreenshotGallery({ product }: { product: Product }) { if (!product.screenshots?.length) return null; return <Section id="screenshots" eyebrow="Screenshots" title={`${product.name} product gallery`}><div className="grid gap-5 md:grid-cols-2">{product.screenshots.map((screenshot, index) => <figure key={screenshot} className="glass overflow-hidden rounded-[2rem] p-3"><ScreenshotImage src={screenshot} alt={`${product.name} screenshot ${index + 1}`} width={1600} height={1000} sizes="(min-width: 768px) 50vw, 100vw" className="rounded-[1.5rem] border border-white/10" /><figcaption className="px-3 py-4 text-sm font-medium text-slate-300">{product.name} screenshot {index + 1}</figcaption></figure>)}</div></Section>; }
function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) { return <section id={id} className="mx-auto max-w-7xl px-6 py-16 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">{eyebrow}</p><h2 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2><div className="mt-10">{children}</div></section>; }
function Card({ children }: { children: React.ReactNode }) { return <div className="glass rounded-3xl p-6">{children}</div>; }
function FactGrid({ items }: { items: { label: string; value: string }[] }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Card key={item.label}><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-300">{item.label}</p><p className="mt-3 text-2xl font-bold text-white">{item.value}</p></Card>)}</div>; }
function ListCard({ title, items, tone }: { title: string; items: string[]; tone: 'pro' | 'con' }) { return <Card><h3 className="text-2xl font-semibold">{title}</h3><ul className="mt-6 space-y-4">{items.map((item) => <li key={item} className="flex gap-3 text-slate-200">{tone === 'pro' ? <Check className="h-6 w-6 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-300" />}{item}</li>)}</ul></Card>; }
function FeatureDetail({ label, value }: { label: string; value?: string }) { if (!value) return null; return <div className="mt-4 border-t border-white/10 pt-4"><p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-200">{label}</p><p className="mt-2 leading-7 text-slate-300">{value}</p></div>; }
function UseCaseDetail({ label, value }: { label: string; value: string }) { return <div className="mt-4"><p className="text-sm font-semibold text-blue-200">{label}</p><p className="mt-1 leading-7 text-slate-300">{value}</p></div>; }
function CardGrid({ items, warning }: { items: NamedItem[]; warning?: boolean }) { return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{items.map((item) => <Card key={item.title}>{warning && <XCircle className="mb-5 h-6 w-6 text-amber-300" />}<h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-slate-300">{item.description}</p></Card>)}</div>; }

function CompareWith({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) { if (relatedProducts.length === 0) return null; return <Section eyebrow="Compare with" title={`Compare ${product.name} against similar tools`}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{relatedProducts.map((tool) => <Link key={tool.slug} href={`/compare/${getComparisonSlug(product, tool)}`} className="glass rounded-3xl p-6 transition hover:border-blue-300/40"><ProductLogo logo={tool.logo} name={tool.name} size={40} className="rounded-xl" /><h3 className="mt-5 text-xl font-semibold text-white">{product.name} vs {tool.name}</h3><p className="mt-3 text-sm text-slate-300">Compare pricing, features, pros, cons, and best-fit users.</p><p className="mt-4 text-sm font-semibold text-blue-200">Compare Now →</p></Link>)}</div></Section>; }
function RelatedReviews({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) { if (relatedProducts.length === 0) return null; return <Section eyebrow="Related reviews" title={`More ${product.categoryBadge?.toLowerCase() ?? 'software'} reviews to compare`}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{relatedProducts.map((tool) => <Link key={tool.slug} href={`/${tool.slug}`} className="glass rounded-3xl p-6 transition hover:border-blue-300/40"><ProductLogo logo={tool.logo} name={tool.name} size={40} className="rounded-xl" /><h3 className="mt-5 text-xl font-semibold text-white">{tool.name}</h3><p className="mt-3 text-sm text-slate-300">{tool.tagline}</p><p className="mt-4 text-sm font-semibold text-blue-200">Read Review →</p></Link>)}</div></Section>; }
function Alternatives({ items }: { items: Alternative[] }) { return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">{items.map((item) => <Card key={item.name}><ProductLogo logo={item.logo} name={item.name} size={48} className="rounded-xl" /><h3 className="mt-5 text-xl font-semibold">{item.name}</h3><p className="mt-3 min-h-24 text-sm text-slate-300">{item.description}</p>{item.slug ? <Link href={`/${item.slug}`} className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">Read Review</Link> : <span className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300">Comparison only</span>}</Card>)}</div>; }
function Comparison({ matrix, productName }: { matrix?: ComparisonMatrix; productName: string }) { const columns = matrix?.columns ?? [productName]; const rows = matrix?.rows ?? []; return <div className="overflow-x-auto rounded-3xl border border-white/10"><table className="w-full min-w-[760px] text-left"><thead className="bg-white/5 text-white"><tr>{['Feature', ...columns].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.feature} className="border-t border-white/10 text-slate-300"><th className="px-5 py-4 text-white">{row.feature}</th>{columns.map((column, index) => <td key={`${row.feature}-${column}`} className="px-5 py-4">{row.values[index] ?? '—'}</td>)}</tr>)}</tbody></table></div>; }
function VerdictMini({ product }: { product: Product }) { return <div className="sticky top-24"><Card><div className="flex text-blue-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div><p className="mt-4 text-3xl font-bold text-white">{product.rating}/5</p><p className="mt-3 text-slate-300">Best for {bestForText(product).toLowerCase()}.</p><CenterCta href={product.affiliateLink}>Try {product.name} →</CenterCta></Card></div>; }
function Verdict({ product }: { product: Product }) { return <div className="glass rounded-[2rem] p-8 lg:p-10"><div className="grid gap-8 lg:grid-cols-[280px_1fr]"><div><p className="text-sm uppercase tracking-[.3em] text-blue-300">Overall Rating</p><p className="mt-3 text-6xl font-bold text-white">{product.rating}</p><p className="text-slate-300">out of 5</p></div><div><h3 className="text-3xl font-bold text-white">Our recommendation</h3><p className="mt-4 text-lg leading-8 text-slate-300">{product.verdict ?? product.review.summary}</p><p className="mt-4 text-slate-200"><strong>Best for:</strong> {bestForText(product)}.</p><div className="mt-8"><AffiliateButton href={product.affiliateLink}>Try {product.name} →</AffiliateButton></div></div></div></div>; }
function SparkLabel({ children }: { children: React.ReactNode }) { return <h3 className="text-xl font-semibold text-white">{children}</h3>; }
function CenterCta({ href, children }: { href: string; children: React.ReactNode }) { return <div className="mt-8 text-center"><AffiliateButton href={href}>{children}</AffiliateButton></div>; }
function AffiliateDisclosure() { return <section className="mx-auto max-w-7xl px-6 lg:px-8"><div className="glass rounded-3xl border border-blue-300/20 p-5 text-sm leading-6 text-slate-300"><strong className="text-white">Affiliate Disclosure</strong><p className="mt-2">If you purchase through links on this page, AIToolBet may earn a commission at no extra cost to you. Our reviews are based on product research and, whenever possible, hands-on testing.</p></div></section>; }
function Footer({ product }: { product: Product }) { return <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-400">© {new Date().getFullYear()} {product.name} review. Affiliate disclosure: links may be sponsored.</footer>; }
