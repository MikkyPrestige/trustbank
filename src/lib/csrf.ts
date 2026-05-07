import { headers } from 'next/headers';

const VALID_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function validateCsrf() {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const referer = headersList.get('referer');

  if (!origin && !referer) {
    throw new Error('CSRF missing Origin/Referer headers');
  }

  const requestOrigin = origin || new URL(referer!).origin;

  if (requestOrigin !== VALID_ORIGIN) {
    throw new Error('CSRF origin mismatch');
  }
}