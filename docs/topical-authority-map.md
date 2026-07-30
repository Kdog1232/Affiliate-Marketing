# AIToolBet topical-authority content map

This repository's canonical SEO plan is the machine-readable
[`strategy/topical-authority-map.json`](../strategy/topical-authority-map.json). It is a content map, not drafted article copy. The map contains 40 evergreen Level 1 pillars, their Level 2 guides, all existing Level 3 reviews, recommended Level 4 comparisons, Level 6 Pinterest campaigns, Level 7 business ideas, and Level 8 prioritization data.

## How to read the hierarchy

```text
Pillar (`/ai-tools/{pillar}`)
└── Guide (`/ai-tools/{pillar}/{guide}`)
    ├── Review (`/reviews/{product}`)
    │   ├── Alternatives (`/reviews/{product}/alternatives`)
    │   └── Pricing (`/reviews/{product}/pricing`)
    └── Comparison (`/compare/{product-a}-vs-{product-b}`)
```

Reviews may appear in more than one guide when the searcher's job-to-be-done genuinely overlaps. `primarySilo` is the canonical breadcrumb and schema parent; `secondarySilos` provide contextual discovery without creating duplicate review URLs.

## Automatic internal-linking contract

1. **Pillar → guides:** show every child guide in a task-oriented directory. Put the highest-priority incomplete guide first.
2. **Guide → pillar and reviews:** breadcrumb to its parent pillar, link its mapped reviews in workflow order, and include a “choose your tool” comparison block.
3. **Review → guide:** show the primary guide above the fold and up to two secondary guide links after relevant feature/use-case sections.
4. **Review → commercial children:** link to that product's pricing and alternatives pages; link only mapped comparisons whose other product is a credible substitute.
5. **Comparison → reviews:** link both reviews, both pricing pages, and both alternatives pages. Add the shared guide as the “see all tools for this workflow” link.
6. **Alternatives/pricing → pillar:** link upward through review → primary guide → pillar, never directly to unrelated pillars.
7. **Contextual body links:** add two to five descriptive anchors per article: one prerequisite guide, one next-step guide, up to two reviews at the point where the workflow needs them, and one comparison where a purchase decision occurs. Do not repeat exact-match anchors or auto-link headings, navigation, or the same destination twice in one section.

## Tree and field definitions

The JSON `silos` array is the complete hierarchical tree. Each silo contains:

- `pillar`: title, slug, intent, audience/problem, priority, and traffic band.
- `guides`: supporting-guide title/slug with nested `reviews` and `comparisons`.
- `pinterest`: exactly ten funnel article ideas, pin titles, and image headlines.
- `authority`: a transparent completeness score, gaps, creation wave, and traffic estimate.

The top-level `reviews` object covers every current product exactly once as a primary entity and gives three viable businesses for each. `reviewIndex` records every primary and secondary silo placement. `comparisonBacklog` is the deduplicated set of recommended comparison URLs.

## Publishing sequence

- **Wave 1 — defend existing depth:** AI tools for teachers, AI coding tools, AI email marketing tools, AI video tools, AI writing tools, and AI website builders. Publish pillars and guides that can immediately route authority to the existing review inventory.
- **Wave 2 — connect commercial workflows:** AI marketing tools, AI productivity tools, AI tools for small business, AI side hustles, AI business ideas, ecommerce, agencies, and digital products.
- **Wave 3 — expand audiences:** students, content creators, freelancers, entrepreneurs, nonprofits, real estate, sales, customer service, HR, and project management.
- **Wave 4 — build categories with review gaps:** healthcare, legal, finance, cybersecurity, data analysis, research, social media, presentations, audio, automation, passive income, local business, and startups.

Traffic figures are directional planning bands, not forecasts. Validate demand, SERP fit, and keyword difficulty before commissioning any page. A page should not be published merely to fill a slot: it needs distinct intent, evidence, and a useful route to the next decision.

## Validation

Run `node scripts/validate-topical-map.js`. The validator checks the 30–50 pillar requirement, Pinterest counts, guide depth, valid product slugs, three business ideas per review, complete product coverage, review-index consistency, unique slugs, and score ranges.
