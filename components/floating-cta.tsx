'use client';

import { useEffect, useState } from 'react';
import { AffiliateButton } from './affiliate-button';

export function FloatingCta({ href, productName }: { href: string; productName: string }) {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setShowFloating(scrollable > 0 && window.scrollY / scrollable >= 0.5);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 p-3 backdrop-blur-xl md:hidden">
        <AffiliateButton href={href} className="w-full">Try {productName} Now</AffiliateButton>
      </div>
      <div className={`fixed bottom-6 right-6 z-50 hidden transition-all duration-300 md:block ${showFloating ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <AffiliateButton href={href}>Try {productName}</AffiliateButton>
      </div>
    </>
  );
}
