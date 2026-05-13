import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const currencySchema = z.object({
  code: z.string().min(1, "Currency code is required").max(10),
  flag: z.string().max(100).optional(),
  rate: z.coerce.number().positive("Rate must be positive"),
});

describe('currencySchema', () => {
  const validCurrency = { code: 'EUR', rate: '1.08' };

  it('accepts valid currency', () => {
    expect(currencySchema.safeParse(validCurrency).success).toBe(true);
  });
  it('rejects empty code', () => {
    expect(currencySchema.safeParse({ code: '', rate: '1' }).success).toBe(false);
  });
  it('rejects overly long code', () => {
    expect(currencySchema.safeParse({ code: 'A'.repeat(11), rate: '1' }).success).toBe(false);
  });
  it('rejects zero rate', () => {
    expect(currencySchema.safeParse({ code: 'USD', rate: '0' }).success).toBe(false);
  });
  it('rejects negative rate', () => {
    expect(currencySchema.safeParse({ code: 'USD', rate: '-5' }).success).toBe(false);
  });
  it('accepts optional flag', () => {
    expect(currencySchema.safeParse({ ...validCurrency, flag: 'us' }).success).toBe(true);
  });
  it('rejects overly long flag', () => {
    expect(currencySchema.safeParse({ ...validCurrency, flag: 'A'.repeat(101) }).success).toBe(false);
  });
});