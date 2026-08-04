'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function isSupportedLogo(logo: string) {
  return /\.(svg|png|webp)(\?.*)?$/i.test(logo.trim());
}

type ProductLogoProps = {
  logo?: string;
  name: string;
  size?: number;
  className?: string;
};

export function ProductLogo({ logo = '', name, size = 56, className = '' }: ProductLogoProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedLogo = logo.trim();
  const shouldShowFallback = !normalizedLogo || !isSupportedLogo(normalizedLogo) || hasError;
  const sharedClassName = `shrink-0 shadow-lg shadow-brand-dark/30 transition duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand-dark/40 ${className}`;

  useEffect(() => {
    setHasError(false);
  }, [normalizedLogo]);

  if (shouldShowFallback) {
    const fallbackSize = Math.max(size, 40);

    return (
      <div
        aria-label={`${name} logo`}
        role="img"
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand via-brand-light to-brand-dark font-bold text-content-primary ring-1 ring-border/15 hover:shadow-brand-light/30 ${sharedClassName}`}
        style={{ width: fallbackSize, height: fallbackSize, fontSize: Math.max(12, Math.round(fallbackSize * 0.42)) }}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-surface p-2 ring-1 ring-border/10 ${sharedClassName}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={normalizedLogo}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="h-full w-full object-contain"
        onError={() => setHasError(true)}
      />
    </span>
  );
}
