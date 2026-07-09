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
  const sharedClassName = `shrink-0 shadow-lg shadow-blue-950/30 transition duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/40 ${className}`;

  useEffect(() => {
    setHasError(false);
  }, [normalizedLogo]);

  if (shouldShowFallback) {
    const fallbackSize = Math.max(size, 40);

    return (
      <div
        aria-label={`${name} logo`}
        role="img"
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 font-bold text-white ring-1 ring-white/15 hover:shadow-blue-400/30 ${sharedClassName}`}
        style={{ width: fallbackSize, height: fallbackSize, fontSize: Math.max(12, Math.round(fallbackSize * 0.42)) }}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-white/95 p-2 ring-1 ring-white/10 ${sharedClassName}`}
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
