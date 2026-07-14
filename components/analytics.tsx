'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { GA_MEASUREMENT_ID, trackAffiliateClick, trackPageView } from '@/lib/analytics';

function getAffiliateMetadata(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href') ?? '';
  let url: URL;

  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin || !url.pathname.startsWith('/go/')) return null;

  const slug = url.pathname.replace(/^\/go\//, '').split('/')[0];
  if (!slug) return null;

  return {
    toolName: anchor.dataset.toolName ?? slug.replaceAll('-', ' '),
    category: anchor.dataset.category,
    destination: url.pathname,
  };
}

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const query = searchParams.toString();
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ''}`;

    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="/go/"], a[href^="http"]');
      if (!anchor) return;

      const metadata = getAffiliateMetadata(anchor);
      if (!metadata) return;

      trackAffiliateClick(metadata);
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>
    </>
  );
}
