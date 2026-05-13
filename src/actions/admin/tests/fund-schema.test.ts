import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const adjustSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(['CREDIT', 'DEBIT'], { message: "Invalid adjustment type" }),
  description: z.string().max(200).optional(),
  displayAmount: z.coerce.number().optional(),
  displayCurrency: z.string().max(10).optional(),
});

describe('adjustSchema (fund adjustment)', () => {
  const validCredit = {
    accountId: 'acc123',
    amount: '250',
    type: 'CREDIT',
    description: 'Manual deposit',
  };

  const validDebit = {
    accountId: 'acc123',
    amount: '100',
    type: 'DEBIT',
  };

  it('accepts a valid credit', () => {
    expect(adjustSchema.safeParse(validCredit).success).toBe(true);
  });

  it('accepts a valid debit', () => {
    expect(adjustSchema.safeParse(validDebit).success).toBe(true);
  });

  it('rejects zero amount', () => {
    const s = adjustSchema.safeParse({ ...validCredit, amount: '0' });
    expect(s.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const s = adjustSchema.safeParse({ ...validCredit, amount: '-50' });
    expect(s.success).toBe(false);
  });

  it('rejects invalid adjustment type', () => {
    const s = adjustSchema.safeParse({ ...validCredit, type: 'INVALID' });
    expect(s.success).toBe(false);
  });

  it('rejects missing accountId', () => {
    const s = adjustSchema.safeParse({ ...validCredit, accountId: '' });
    expect(s.success).toBe(false);
  });

  it('rejects overly long description', () => {
    const s = adjustSchema.safeParse({ ...validCredit, description: 'A'.repeat(201) });
    expect(s.success).toBe(false);
  });
});