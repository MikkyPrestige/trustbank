import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(300),
  answer: z.string().min(1, "Answer is required").max(5000),
  category: z.string().max(50).optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

describe('faqSchema', () => {
  const validFaq = { question: 'What is this?', answer: 'This is an FAQ.' };

  it('accepts valid FAQ', () => {
    expect(faqSchema.safeParse(validFaq).success).toBe(true);
  });
  it('rejects empty question', () => {
    expect(faqSchema.safeParse({ ...validFaq, question: '' }).success).toBe(false);
  });
  it('rejects empty answer', () => {
    expect(faqSchema.safeParse({ ...validFaq, answer: '' }).success).toBe(false);
  });
  it('rejects overly long question', () => {
    expect(faqSchema.safeParse({ ...validFaq, question: 'A'.repeat(301) }).success).toBe(false);
  });
  it('accepts optional category and order', () => {
    expect(faqSchema.safeParse({ ...validFaq, category: 'General', order: '2' }).success).toBe(true);
  });
});