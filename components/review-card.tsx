import { Star } from 'lucide-react';
import type { Product } from '@/lib/products';

export function ReviewCard({ product }: { product: Product }) {
  return (
    <section id="review" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="glass rounded-3xl p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[.3em] text-brand-light">Review verdict</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-content-primary sm:text-5xl">{product.review.title}</h2>
            <p className="mt-4 text-lg leading-8 text-content-secondary">{product.review.summary}</p>
            <p className="mt-5 text-sm text-content-muted">Reviewed by {product.review.author} · Updated {product.review.datePublished}</p>
          </div>
          <div className="rounded-3xl border border-brand-light/20 bg-brand-light/10 p-6 text-center">
            <div className="flex justify-center text-brand-light">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-6 w-6 fill-current" aria-hidden="true" />)}</div>
            <p className="mt-3 text-5xl font-bold text-content-primary">{product.rating}</p>
            <p className="text-sm text-content-secondary">Based on {product.reviewCount.toLocaleString()} review signals</p>
          </div>
        </div>
      </div>
    </section>
  );
}
