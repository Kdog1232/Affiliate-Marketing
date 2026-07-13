import Link from 'next/link';
import { Clock, DollarSign, Star, Target } from 'lucide-react';
import type { Product } from '@/lib/products';
import { getPricingText, listBestFor } from '@/lib/comparisons';
import { AffiliateButton } from './affiliate-button';
import { ScreenshotImage } from './ScreenshotImage';

export function ProductHero({ product }: { product: Product }) {
  const quickFacts = [
    { label: 'Setup time', value: product.setupTime, icon: Clock },
    { label: 'Best for', value: listBestFor(product).join(', '), icon: Target },
    { label: 'Pricing', value: getPricingText(product), icon: DollarSign },
    { label: 'Rating', value: `${product.rating}/5`, icon: Star },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-28 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:pt-36">
      <div className="flex flex-col justify-center">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
          <Star className="h-4 w-4 fill-current" aria-hidden="true" /> Pinterest-friendly affiliate review
        </div>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">{product.tagline}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{product.description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <AffiliateButton href={product.affiliateLink}>Try {product.name}</AffiliateButton>
          <Link href="#review" className="focus-ring inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10">Read Review</Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {quickFacts.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <Icon className="mb-3 h-5 w-5 text-blue-300" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[.2em] text-slate-400">{label}</p>
              <p className="mt-1 font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass relative rounded-[2rem] p-3">
        <ScreenshotImage priority src={product.heroImage} alt={`${product.name} replaceable dashboard screenshot placeholder`} width={1600} height={1000} sizes="(min-width: 1024px) 46vw, 100vw" className="rounded-[1.5rem]" />
      </div>
    </section>
  );
}
