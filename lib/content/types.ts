import type { Product } from '@/lib/products';

export type ContentType = 'reviews' | 'buying-guides' | 'tutorials' | 'alternatives';
export type ReviewSectionKey = 'overview' | 'pros' | 'cons' | 'pricingSummary' | 'whoShouldBuy' | 'whoShouldAvoid' | 'useCases' | 'faq' | 'verdict';
export type GeneratedSection = { key: ReviewSectionKey; title: string; content: string | string[] | { question: string; answer: string }[]; generatedAt: string; model: string; sourceFields: string[] };
export type ReviewDraft = { type: 'review'; slug: string; productSlug: string; status: 'draft' | 'needs_review' | 'approved' | 'published'; generatedAt: string; updatedAt: string; model: string; seo: { title: string; metaDescription: string; canonical: string }; sections: Record<ReviewSectionKey, GeneratedSection>; productSnapshot: Pick<Product, 'slug' | 'name' | 'rating' | 'pricing' | 'categories' | 'platforms' | 'affiliateLink' | 'logo' | 'features'>; humanReview?: { reviewedBy?: string; reviewedAt?: string; notes?: string } };
export type ContentIndexItem = { productSlug: string; productName: string; status: 'Missing Data' | 'Needs Review' | 'Draft' | 'Published' | 'Needs Regeneration'; draftPath?: string; publishedPath?: string; generatedDate?: string; model?: string; seoScore: number };
