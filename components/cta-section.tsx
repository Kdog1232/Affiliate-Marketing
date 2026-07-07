import type { Product } from '@/lib/products';
import { AffiliateButton } from './affiliate-button';

export function CTASection({ product, title = 'Start creating better campaigns today', description }: { product: Product; title?: string; description?: string }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
      <div className="glass rounded-[2rem] p-10 sm:p-16">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-slate-300">{description ?? `Use the button below to visit ${product.name}. Replace this URL in the product JSON with your affiliate link.`}</p>
        <div className="mt-8"><AffiliateButton href={product.affiliateLink}>Start Free Today</AffiliateButton></div>
      </div>
    </section>
  );
}
