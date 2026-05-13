export async function GET() {
  const secret = process.env.AUTH_SECRET ? 'PRESENT' : 'MISSING';
  const url = process.env.AUTH_URL ?? 'MISSING';

  return Response.json({ AUTH_SECRET: secret, AUTH_URL: url });
}