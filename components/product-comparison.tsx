import type { Product } from '@/lib/products';
import { AffiliateButton } from './affiliate-button';

export function ProductComparison({ product }: { product: Product }) {
  return (
    <section id="comparison" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.3em] text-blue-300">Comparison</p>
      <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">{product.name} vs competitors</h2>
      <div className="glass mt-10 overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Comparison table for {product.name} against competing tools</caption>
            <thead className="bg-white/10 text-slate-100"><tr><th className="p-5">Feature</th><th className="p-5">{product.name}</th><th className="p-5">Typical competitors</th><th className="p-5">Best fit</th></tr></thead>
            <tbody>{product.comparison.map((row) => <tr key={row.feature} className="border-t border-white/10"><td className="p-5 font-semibold text-white">{row.feature}</td><td className="p-5 text-slate-200">{row.product}</td><td className="p-5 text-slate-300">{row.competitors}</td><td className="p-5 text-blue-200">{row.winner}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="mt-8 text-center"><AffiliateButton href={product.affiliateLink}>Try the winner</AffiliateButton></div>
    </section>
  );
}
