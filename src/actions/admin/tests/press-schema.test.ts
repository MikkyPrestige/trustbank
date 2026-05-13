import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const pressSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().min(1, "Summary is required").max(2000),
  category: z.string().max(50).optional(),
  link: z.string().max(500).optional(),
  date: z.string().optional(),
});

describe('pressSchema', () => {
  const validPress = { title: 'New Branch Opens', summary: 'A new branch has opened in downtown.' };

  it('accepts valid press release', () => {
    expect(pressSchema.safeParse(validPress).success).toBe(true);
  });
  it('rejects empty title', () => {
    expect(pressSchema.safeParse({ ...validPress, title: '' }).success).toBe(false);
  });
  it('rejects empty summary', () => {
    expect(pressSchema.safeParse({ ...validPress, summary: '' }).success).toBe(false);
  });
  it('rejects overly long title', () => {
    expect(pressSchema.safeParse({ ...validPress, title: 'A'.repeat(201) }).success).toBe(false);
  });
  it('accepts optional category and link', () => {
    expect(pressSchema.safeParse({ ...validPress, category: 'News', link: 'https://example.com' }).success).toBe(true);
  });
  it('rejects overly long link', () => {
    expect(pressSchema.safeParse({ ...validPress, link: 'A'.repeat(501) }).success).toBe(false);
  });
});