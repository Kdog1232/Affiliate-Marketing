import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url), 303);

  for (const cookie of request.cookies.getAll()) {
    response.cookies.delete(cookie.name);
  }

  return response;
}
