'use client';

import { FormEvent, KeyboardEvent, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { findExactProductMatch, normalizeSearchQuery, searchProducts, type SearchableProduct } from '@/lib/search';
import { ProductLogo } from './ProductLogo';

type Props = { products: SearchableProduct[] };

export function HomepageSearch({ products }: Props) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = normalizeSearchQuery(query);
  const suggestions = useMemo(() => searchProducts(products, query).slice(0, 8), [products, query]);
  const hasSuggestions = normalizedQuery.length > 0 && suggestions.length > 0;

  function openProduct(product: SearchableProduct) {
    router.push(product.href);
  }

  function submitSearch() {
    const exact = findExactProductMatch(products, query);
    if (exact) {
      router.push(exact.href);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    submitSearch();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!hasSuggestions) {
      if (event.key === 'Enter') submitSearch();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      openProduct(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setActiveIndex(-1);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative mx-auto mt-10 max-w-2xl" role="search">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.08] p-3 text-left shadow-2xl shadow-black/20">
        <Search className="h-6 w-6 shrink-0 text-blue-300" aria-hidden="true" />
        <input
          id={inputId}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); }}
          onKeyDown={onKeyDown}
          aria-label="Search published AI tool reviews"
          aria-autocomplete="list"
          aria-controls={hasSuggestions ? listboxId : undefined}
          aria-expanded={hasSuggestions}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${suggestions[activeIndex].slug}` : undefined}
          className="min-w-0 flex-1 bg-transparent text-white placeholder:text-slate-300 focus:outline-none"
          placeholder="Search AI tools by name, category, features, or tags"
          type="search"
        />
        <button type="submit" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">Search</button>
      </div>
      {hasSuggestions && (
        <ul id={listboxId} role="listbox" className="absolute z-40 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-left shadow-2xl shadow-black/40 backdrop-blur-xl">
          {suggestions.map((product, index) => (
            <li key={product.slug} id={`${listboxId}-${product.slug}`} role="option" aria-selected={activeIndex === index}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openProduct(product)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${activeIndex === index ? 'bg-blue-500/25' : 'hover:bg-white/10'}`}
              >
                <ProductLogo logo={product.logo} name={product.name} size={36} className="rounded-lg" />
                <span><span className="block font-semibold text-white">{product.name}</span><span className="block text-sm text-slate-300">{product.categoryBadge ?? product.primaryCategory ?? product.category ?? 'AI Tool'} · {product.rating}/5</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
