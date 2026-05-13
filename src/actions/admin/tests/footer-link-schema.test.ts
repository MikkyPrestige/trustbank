import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const footerLinkSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  href: z.string().min(1, "URL is required").max(500),
  column: z.string().max(50).optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

describe('footerLinkSchema', () => {
  const validLink = { label: 'Privacy', href: '/privacy' };

  it('accepts valid link', () => {
    expect(footerLinkSchema.safeParse(validLink).success).toBe(true);
  });
  it('rejects empty label', () => {
    expect(footerLinkSchema.safeParse({ ...validLink, label: '' }).success).toBe(false);
  });
  it('rejects empty href', () => {
    expect(footerLinkSchema.safeParse({ ...validLink, href: '' }).success).toBe(false);
  });
  it('rejects long label', () => {
    expect(footerLinkSchema.safeParse({ ...validLink, label: 'A'.repeat(101) }).success).toBe(false);
  });
  it('rejects long href', () => {
    expect(footerLinkSchema.safeParse({ ...validLink, href: 'A'.repeat(501) }).success).toBe(false);
  });
  it('accepts optional column and order', () => {
    expect(footerLinkSchema.safeParse({ ...validLink, column: 'company', order: '1' }).success).toBe(true);
  });
});