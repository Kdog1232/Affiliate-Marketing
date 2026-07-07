import { ImageResponse } from 'next/og';
import { getProduct } from '@/lib/products';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const name = product?.name ?? 'Affiliate Review';
  const tagline = product?.tagline ?? 'Product review and comparison';

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 72, background: 'radial-gradient(circle at 20% 0%, #2563eb55, transparent 35%), #020617', color: 'white' }}>
      <div style={{ fontSize: 28, color: '#93c5fd', marginBottom: 24 }}>{name} Review</div>
      <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 940 }}>{tagline}</div>
      <div style={{ marginTop: 36, fontSize: 30, color: '#cbd5e1' }}>Features · Pricing · Pros & Cons · Comparison</div>
    </div>,
    { ...size },
  );
}
