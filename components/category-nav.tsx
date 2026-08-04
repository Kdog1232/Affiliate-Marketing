import Link from 'next/link';
import { CATEGORIES, getCategoryHref } from '@/lib/products';

export function CategoryNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Category navigation" className={compact ? 'flex flex-wrap gap-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={getCategoryHref(category)}
          className={compact ? 'rounded-full border border-border bg-surface px-3 py-2 text-sm text-content-secondary hover:border-brand-light/60 hover:text-content-primary' : 'glass rounded-3xl p-5 transition hover:-translate-y-1 hover:border-brand-light/60'}
        >
          <span className={compact ? '' : 'text-lg font-semibold text-content-primary'}>{category.name}</span>
          {!compact && <span className="mt-2 block text-sm text-content-secondary">Compare tools for {category.name.toLowerCase()} workflows.</span>}
        </Link>
      ))}
    </nav>
  );
}
