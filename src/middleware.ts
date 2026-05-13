import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// In production, use the real authentication middleware.
// In all other environments (development, test), allow everything.
export default async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return (NextAuth(authConfig).auth as any)(request);
  }

  // Non‑production: just pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

