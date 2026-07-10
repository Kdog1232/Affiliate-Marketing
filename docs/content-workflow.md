# AI-assisted publishing workflow

AIToolBet is static and SEO-first. OpenAI is used only by local CLI commands to draft editorial copy from existing product JSON. Drafts are private until a human reviews and publishes them.

## Add a product

1. Add `products/<slug>.json` with factual data: pricing, features, ratings, setup time, categories, integrations, platforms, affiliate links, logos, screenshots, pros, cons, FAQs, and schema-ready review metadata.
2. Run `npm run validate:reviews` to confirm required review fields are present.
3. Run `npm run verify:logos` to confirm referenced logo assets exist.

## Generate review draft

```bash
OPENAI_API_KEY=... npm run generate:review chatgpt
```

Use `-- --force` to regenerate an existing draft:

```bash
OPENAI_API_KEY=... npm run generate:review chatgpt -- --force
```

Regenerate one section only:

```bash
OPENAI_API_KEY=... npm run generate:review chatgpt -- --section=pricingSummary --force
```

Drafts are written to `content/drafts/reviews/<slug>.json`.

## Review drafts

Open `/admin/content` in a local/admin build. The dashboard shows product status, draft/published state, SEO score, generated date, and model used.

Open a draft to edit each section independently. The page includes Save Draft, Preview, and Publish controls. Preview uses the existing production review layout so editors see exactly how the page will look.

## Publish

Publishing moves the reviewed JSON from `content/drafts/reviews/` to `content/published/reviews/`. No AI runs during publishing. Public pages read only product JSON plus approved content from `content/published`.

## Static safety rules

- Drafts are never read by public product pages.
- OpenAI calls happen only in CLI generation commands.
- Prompts live in `lib/content/prompts.ts`.
- Provider logic lives in `lib/content/providers.ts` so Anthropic, Gemini, OpenRouter, or another provider can be added without changing page rendering.
