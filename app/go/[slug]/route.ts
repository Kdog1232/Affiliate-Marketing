import { NextResponse } from 'next/server';
import { getAffiliateDestination } from '@/lib/affiliate-links';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const destination = getAffiliateDestination(slug);

  if (!destination) {
    return NextResponse.redirect(new URL('/', _request.url));
  }

  return NextResponse.redirect(destination, 302);
}
