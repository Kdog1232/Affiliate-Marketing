import Link from 'next/link';
import { getContentIndex } from '@/lib/content/storage';

export const dynamic = 'force-dynamic';

export default async function ContentDashboard() {
  const items = await getContentIndex();
  return <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100"><div className="mx-auto max-w-7xl"><h1 className="text-4xl font-bold">Content Review Studio</h1><p className="mt-3 text-slate-300">Offline-generated drafts stay private until a human publishes them.</p><div className="mt-8 overflow-hidden rounded-3xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/10 text-slate-200"><tr>{['Product','Status','Draft','Published','SEO Score','Generated Date','Model Used'].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{items.map((item)=><tr key={item.productSlug} className="border-t border-white/10"><td className="px-4 py-4 font-semibold"><Link href={`/admin/content/reviews/${item.productSlug}`} className="text-blue-200 hover:underline">{item.productName}</Link></td><td className="px-4 py-4">{item.status}</td><td className="px-4 py-4">{item.draftPath ? 'Yes' : 'No'}</td><td className="px-4 py-4">{item.publishedPath ? 'Yes' : 'No'}</td><td className="px-4 py-4">{item.seoScore}/100</td><td className="px-4 py-4">{item.generatedDate ? new Date(item.generatedDate).toLocaleString() : '—'}</td><td className="px-4 py-4">{item.model ?? '—'}</td></tr>)}</tbody></table></div></div></main>;
}
