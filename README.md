# JSON-driven affiliate landing pages

This Next.js 15 App Router template creates one production-ready SaaS-style affiliate landing page per JSON file in `products/`.

## Create a new affiliate page in under two minutes

1. Duplicate `products/adcreative.json` and rename it to your URL slug, for example `products/cursor.json` creates `/cursor` automatically.
2. Replace `slug`, `name`, `tagline`, `description`, `pricing`, `setupTime`, `bestFor`, and `rating` with the new product details.
3. Replace `affiliateLink` with your affiliate URL. Every CTA automatically opens it in a new tab with `rel="nofollow sponsored"`.
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
