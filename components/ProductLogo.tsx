'use client';

import Image from 'next/image';
import { useState } from 'react';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

type ProductLogoProps = {
  logo?: string;
  name: string;
  size?: number;
  className?: string;
};

export function ProductLogo({ logo = '', name, size = 56, className = '' }: ProductLogoProps) {
  const [hasError, setHasError] = useState(false);
  const shouldShowFallback = !logo.trim() || hasError;
  const sharedClassName = `shrink-0 shadow-lg shadow-blue-950/30 transition duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/40 ${className}`;

  if (shouldShowFallback) {
    return (
      <div
        aria-label={`${name} logo`}
        role="img"
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 font-bold text-white ring-1 ring-white/15 ${sharedClassName}`}
        style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.42)) }}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <Image
      src={logo}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`object-contain bg-white/5 ring-1 ring-white/10 ${sharedClassName}`}
      onError={() => setHasError(true)}
    />
  );
}
