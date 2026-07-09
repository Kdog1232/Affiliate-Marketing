import { redirect } from 'next/navigation';
import { getCategoryByPathSlug, getCategoryHref } from '@/lib/products';

type Props = { params: Promise<{ category: string }> };

export default async function LegacyCategoryRedirect({ params }: Props) {
  const { category } = await params;
  const match = getCategoryByPathSlug(category);
  redirect(match ? getCategoryHref(match) : '/#categories');
}
