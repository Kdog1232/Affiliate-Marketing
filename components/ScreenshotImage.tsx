'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type ScreenshotImageProps = ImageProps & {
  fallbackSrc?: string;
};

function svgFallbackFor(src: ImageProps['src']) {
  return typeof src === 'string' && src.endsWith('.png') ? src.replace(/\.png$/, '.svg') : undefined;
}

export function ScreenshotImage({ src, fallbackSrc, alt, onError, ...props }: ScreenshotImageProps) {
  const fallback = fallbackSrc ?? svgFallbackFor(src);
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (fallback && currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
        onError?.(event);
      }}
    />
  );
}
