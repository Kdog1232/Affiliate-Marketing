import { ShieldCheck } from 'lucide-react';
import type { Product } from '@/lib/products';

export function TrustSection({ product }: { product: Product }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-brand-light">Why trust this review</p>
      <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-content-primary sm:text-5xl">Clear affiliate disclosure, practical testing criteria, and balanced recommendations.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {product.whyTrust.map((item) => <div key={item.title} className="glass rounded-3xl p-6"><ShieldCheck className="mb-5 h-6 w-6 text-brand-light" aria-hidden="true" /><h3 className="text-xl font-semibold text-content-primary">{item.title}</h3><p className="mt-3 text-content-secondary">{item.description}</p></div>)}
      </div>
    </section>
  );
}
