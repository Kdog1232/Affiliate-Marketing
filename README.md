# JSON-driven affiliate landing pages

This Next.js 15 App Router template creates one production-ready SaaS-style affiliate landing page per JSON file in `products/`.

## Create a new affiliate page in under two minutes

1. Duplicate an existing JSON file in `products/` and rename it to your URL slug, for example `products/cursor.json` creates `/cursor` automatically.
2. Replace `slug`, `name`, `tagline`, `description`, `pricing`, `setupTime`, `bestFor`, and `rating` with the new product details.
3. Replace `affiliateLink` with your affiliate URL. Every CTA automatically opens it in a new tab with `rel="nofollow sponsored noopener noreferrer"`.
4. Replace `logo` and `heroImage` with optimized product screenshots or placeholder URLs. Add any new remote image domain to `next.config.ts`.
5. Replace `features`, `pros`, `cons`, `pricingPlans`, `comparison`, `whyTrust`, `notFor`, `socialProof`, `testimonials`, and `faq`.
6. Deploy to Vercel and set `NEXT_PUBLIC_SITE_URL` to your production domain for canonical URLs, robots, sitemap, and generated social images.

## Conversion features included

- Sticky mobile "Try Now" button.
- Floating desktop CTA after the visitor scrolls halfway down the page.
- CTA placements in the hero, features, pros/cons, comparison, pricing, and bottom sections.
- Product, FAQ, Review, and Breadcrumb schema.
- Automatically generated favicon, Open Graph image, and Twitter image.
- Reusable `ProductHero`, `ProductComparison`, `CTASection`, `ReviewCard`, `TrustSection`, and `ProductTemplate` components.

## Commands

```bash
npm install
npm run dev
npm run build
```

`npm run build` only compiles the Next.js application for production. Screenshot generation is intentionally separate so Vercel deployments are not blocked by Playwright, browser downloads, or local server timing issues.

Use `npm run screenshots` when you want to refresh generated screenshots locally. The command builds the app for local preview, starts Next.js on `127.0.0.1:3000`, waits for the site to respond, captures pages with Playwright, validates the generated files, and exits. Install the browser once with `npx playwright install chromium` before running it.

Use `npm run publish` for the editorial publishing flow. It generates reviews, attempts screenshots as a non-blocking enhancement, and then runs the production build even if screenshot capture fails.

## Google Analytics 4 setup

Analytics is installed globally from the root App Router layout, so every public page is tracked automatically after hydration. The implementation uses the official Google `gtag.js` loader because the `@next/third-parties/google` package could not be installed from the package registry in this environment. Page views are sent from the client route tracker with `send_page_view: false` in the initial GA config so route changes are tracked without duplicate initial `page_view` events.

### Change the Measurement ID

Set the public GA4 Measurement ID in `.env` or in your hosting provider environment variables:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-JCS70Q4W08
```

To switch properties, replace the value with the new GA4 Measurement ID and redeploy the app. Do not hardcode Measurement IDs in React components; read them through `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### Disable analytics locally

Remove `NEXT_PUBLIC_GA_MEASUREMENT_ID` from your local environment, leave it blank, or run the app with an empty value:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID= npm run dev
```

When the variable is missing, the analytics scripts, automatic page views, and click listeners are not registered.

### Custom events

Reusable helpers live in `lib/analytics.ts`:

- `trackEvent(eventName, parameters)` for any GA4 event.
- `trackAffiliateClick({ toolName, category, destination })` sends `affiliate_click` with `tool_name`, `category`, and `destination`.
- `trackSearch(searchTerm, resultCount)` sends `site_search`.
- `trackComparison(comparisonName, toolNames)` sends `comparison_view`.
- `trackReviewView(toolName, category)` sends `review_view`.
- `trackCategoryView(category)` sends `category_view`.

Example:

```ts
import { trackEvent } from '@/lib/analytics';

trackEvent('category_view', { category: 'AI Writing' });
```

Affiliate redirect clicks are tracked automatically for internal `/go/...` links such as `/go/chatgpt`, `/go/claude`, `/go/copybase-ai`, `/go/bluefx`, `/go/elevenlabs`, and `/go/canva`. Add `data-tool-name` and `data-category` to links when you want friendlier event parameters; otherwise the tool name is inferred from the redirect slug.
