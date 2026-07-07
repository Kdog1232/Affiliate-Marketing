import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, Minus, Star, Sparkles, ChartBar, Image as ImageIcon, PenTool, Layers, Zap, XCircle } from 'lucide-react';
import type { Product } from '@/lib/products';
import { AffiliateButton } from './affiliate-button';
import { CTASection } from './cta-section';
import { FloatingCta } from './floating-cta';
import { ProductComparison } from './product-comparison';
import { ProductHero } from './product-hero';
import { ReviewCard } from './review-card';
import { TrustSection } from './trust-section';

const icons = { Sparkles, ChartBar, Image: ImageIcon, PenTool, Layers, Zap };

export function ProductTemplate({ product }: { product: Product }) {
  const productSchema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.heroImage, brand: { '@type': 'Brand', name: product.name }, aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, bestRating: 5, reviewCount: product.reviewCount }, review: { '@type': 'Review', author: { '@type': 'Person', name: product.review.author }, datePublished: product.review.datePublished, name: product.review.title, reviewBody: product.review.summary, reviewRating: { '@type': 'Rating', ratingValue: product.rating, bestRating: 5 } }, offers: { '@type': 'Offer', url: product.affiliateLink, price: product.pricing, availability: 'https://schema.org/InStock' } };
  const reviewSchema = { '@context': 'https://schema.org', '@type': 'Review', itemReviewed: { '@type': 'Product', name: product.name, image: product.heroImage, description: product.description }, author: { '@type': 'Person', name: product.review.author }, datePublished: product.review.datePublished, name: product.review.title, reviewBody: product.review.summary, reviewRating: { '@type': 'Rating', ratingValue: product.rating, bestRating: 5 } };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: '/' }, { '@type': 'ListItem', position: 2, name: product.name, item: `/${product.slug}` }] };

  return <main className="min-h-screen overflow-hidden bg-radial-blue pb-20 md:pb-0">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <Navbar product={product} />
    <ProductHero product={product} />
    <SocialProof product={product} />
    <Section id="features" eyebrow="Features" title={`Why Pinterest visitors choose ${product.name}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{product.features.map((feature) => { const Icon = icons[feature.icon as keyof typeof icons] ?? Sparkles; return <Card key={feature.title}><Icon className="mb-5 h-6 w-6 text-blue-300" aria-hidden="true" /><h3 className="text-xl font-semibold text-white">{feature.title}</h3><p className="mt-3 text-slate-300">{feature.description}</p></Card>; })}</div>
      <div className="mt-8 text-center"><AffiliateButton href={product.affiliateLink}>Try {product.name} after exploring features</AffiliateButton></div>
    </Section>
    <Section eyebrow="Workflow" title="How it works"><div className="grid gap-4 md:grid-cols-4">{product.howItWorks.map((step, index) => <Card key={step.title}><span className="text-sm font-semibold text-blue-300">Step {index + 1}</span><h3 className="mt-4 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-slate-300">{step.description}</p></Card>)}</div></Section>
    <ReviewCard product={product} />
    <Section eyebrow="Pros & Cons" title="A balanced review"><div className="grid gap-6 lg:grid-cols-2"><ListCard title="What we like" items={product.pros} icon="check" /><ListCard title="Keep in mind" items={product.cons} icon="minus" /></div><div className="mt-8 text-center"><AffiliateButton href={product.affiliateLink}>Try it after reading pros & cons</AffiliateButton></div></Section>
    <ProductComparison product={product} />
    <Section id="pricing" eyebrow="Pricing" title={product.pricing}><div className="grid gap-4 lg:grid-cols-3">{product.pricingPlans.map((plan) => <Card key={plan.name}><h3 className="text-2xl font-semibold">{plan.name}</h3><p className="mt-2 text-3xl font-bold text-white">{plan.price}</p><p className="mt-3 text-slate-300">{plan.description}</p><ul className="my-6 space-y-3">{plan.features.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-200"><Check className="h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />{item}</li>)}</ul><AffiliateButton href={product.affiliateLink}>{plan.cta}</AffiliateButton></Card>)}</div></Section>
    <Section eyebrow="Use cases" title="Who should use it"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{product.audiences.map((item) => <Card key={item.title}><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-slate-300">{item.description}</p></Card>)}</div></Section>
    <Section eyebrow="Not a fit" title="Who should NOT buy this"><div className="grid gap-4 md:grid-cols-3">{product.notFor.map((item) => <Card key={item.title}><XCircle className="mb-5 h-6 w-6 text-amber-300" aria-hidden="true" /><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-slate-300">{item.description}</p></Card>)}</div></Section>
    <TrustSection product={product} />
    <Section id="faq" eyebrow="FAQ" title="Frequently asked questions"><div className="mx-auto max-w-3xl space-y-3">{product.faq.map((item) => <details key={item.question} className="glass group rounded-2xl p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">{item.question}<ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" aria-hidden="true" /></summary><p className="mt-4 text-slate-300">{item.answer}</p></details>)}</div></Section>
    <CTASection product={product} />
    <Footer product={product} />
    <FloatingCta href={product.affiliateLink} productName={product.name} />
  </main>;
}

function Navbar({ product }: { product: Product }) { return <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"><Link href={`/${product.slug}`} className="flex items-center gap-3 font-semibold"><Image src={product.logo} alt={`${product.name} replaceable logo placeholder`} width={32} height={32} className="rounded-lg" />{product.name}</Link><div className="hidden gap-6 text-sm text-slate-300 md:flex"><a href="#features">Features</a><a href="#comparison">Compare</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><AffiliateButton href={product.affiliateLink}>Try Now</AffiliateButton></div></nav>; }
function SocialProof({ product }: { product: Product }) { return <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div className="grid gap-4 lg:grid-cols-3"><Card><div className="flex text-blue-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" aria-hidden="true" />)}</div><p className="mt-3 text-2xl font-semibold">{product.rating}/5 average rating</p></Card><Card><p className="text-sm text-blue-200">Trusted by</p><p className="mt-3 text-2xl font-semibold">{product.users}</p></Card><Card><p className="text-sm text-blue-200">Built for</p><p className="mt-3 text-2xl font-semibold">{product.platforms.join(', ')}</p></Card></div><div className="mt-4 grid gap-4 md:grid-cols-3">{product.socialProof.map((item) => <Card key={item.metric}><p className="text-3xl font-bold text-white">{item.metric}</p><p className="mt-1 font-semibold text-blue-200">{item.label}</p><p className="mt-3 text-slate-300">{item.description}</p></Card>)}</div><div className="mt-4 grid gap-4 md:grid-cols-3">{product.testimonials.map((t) => <Card key={t.author}><p className="text-slate-200">“{t.quote}”</p><p className="mt-4 text-sm text-blue-200">{t.author} · {t.role}</p></Card>)}</div></section>; }
function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) { return <section id={id} className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">{eyebrow}</p><h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2><div className="mt-10">{children}</div></section>; }
function Card({ children }: { children: React.ReactNode }) { return <div className="glass rounded-3xl p-6">{children}</div>; }
function ListCard({ title, items, icon }: { title: string; items: string[]; icon: 'check' | 'minus' }) { return <Card><h3 className="text-2xl font-semibold">{title}</h3><ul className="mt-6 space-y-4">{items.map((item) => <li key={item} className="flex gap-3 text-slate-200">{icon === 'check' ? <Check className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" /> : <Minus className="h-6 w-6 shrink-0 text-amber-300" aria-hidden="true" />}{item}</li>)}</ul></Card>; }
function Footer({ product }: { product: Product }) { return <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-400">© {new Date().getFullYear()} {product.name} review template. Affiliate disclosure: links may be sponsored.</footer>; }
