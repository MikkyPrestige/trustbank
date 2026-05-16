import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export default async function middleware() {
  // E2E test bypass
  if (process.env.NODE_ENV !== 'production') {
    try {
      const cookieStore = await cookies();
      const testCookie = cookieStore.get('test-auth');
      if (testCookie?.value === 'true') {
        return NextResponse.next();
      }
    } catch {}
  }

  // No auth checks here
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
