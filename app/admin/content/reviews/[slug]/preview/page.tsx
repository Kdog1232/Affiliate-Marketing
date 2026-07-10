import { notFound } from 'next/navigation';
import { getProduct, getProducts, getRelatedProducts } from '@/lib/products';
import { readReviewDraft } from '@/lib/content/storage';
import { applyPublishedReview } from '@/lib/published-content';
import { LandingPage } from '@/components/landing-page';
export const dynamic = 'force-dynamic';
export default async function Preview({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const product = await getProduct(slug); const draft = await readReviewDraft(slug); if (!product || !draft) notFound(); const preview = applyPublishedReview(product, draft); const products = await getProducts(); return <LandingPage product={preview} relatedProducts={getRelatedProducts(preview, products)} />; }
