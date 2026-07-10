'use server';
import { redirect } from 'next/navigation';
import { readReviewDraft, writeReviewDraft, publishReview } from '@/lib/content/storage';
import type { ReviewSectionKey } from '@/lib/content/types';
const keys: ReviewSectionKey[] = ['overview','pros','cons','pricingSummary','whoShouldBuy','whoShouldAvoid','useCases','faq','verdict'];
export async function saveDraft(formData: FormData) { const slug = String(formData.get('slug')); const draft = await readReviewDraft(slug); if (!draft) throw new Error('Draft not found'); for (const key of keys) { const raw = String(formData.get(key) ?? ''); if (!draft.sections[key]) continue; draft.sections[key].content = key === 'faq' ? JSON.parse(raw) : ['overview','pros','cons','whoShouldBuy','whoShouldAvoid','useCases'].includes(key) ? raw.split('\n').map((x)=>x.trim()).filter(Boolean) : raw; } draft.status = 'needs_review'; draft.updatedAt = new Date().toISOString(); await writeReviewDraft(draft); redirect(`/admin/content/reviews/${slug}`); }
export async function publishDraft(formData: FormData) { const slug = String(formData.get('slug')); await publishReview(slug); redirect('/admin/content'); }
