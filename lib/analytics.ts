export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function trackEvent(eventName: string, parameters: AnalyticsParams = {}) {
  if (typeof window === 'undefined' || !isAnalyticsEnabled() || typeof window.gtag !== 'function') return;

  const cleanedParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null),
  );

  window.gtag('event', eventName, cleanedParameters);
}

export function trackPageView(url: string) {
  if (!GA_MEASUREMENT_ID) return;

  trackEvent('page_view', {
    page_location: url,
    page_path: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackAffiliateClick({
  toolName,
  category,
  destination,
}: {
  toolName: string;
  category?: string;
  destination: string;
}) {
  trackEvent('affiliate_click', {
    tool_name: toolName,
    category,
    destination,
  });
}

export function trackSearch(searchTerm: string, resultCount?: number) {
  trackEvent('site_search', {
    search_term: searchTerm,
    result_count: resultCount,
  });
}

export function trackComparison(comparisonName: string, toolNames?: string[]) {
  trackEvent('comparison_view', {
    comparison_name: comparisonName,
    tools: toolNames?.join(','),
  });
}

export function trackReviewView(toolName: string, category?: string) {
  trackEvent('review_view', {
    tool_name: toolName,
    category,
  });
}

export function trackCategoryView(category: string) {
  trackEvent('category_view', {
    category,
  });
}
