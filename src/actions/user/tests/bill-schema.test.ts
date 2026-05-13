import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const billSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  provider: z.string().min(1, "Provider is required").max(100),
  accountNumber: z.string().max(50).optional(),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

describe('billSchema', () => {
  const validBill = {
    amount: '75',
    provider: 'Electric Company',
    pin: '1234',
  };

  it('accepts valid bill payment', () => {
    expect(billSchema.safeParse(validBill).success).toBe(true);
  });

  it('rejects zero amount', () => {
    const s = billSchema.safeParse({ ...validBill, amount: '0' });
    expect(s.success).toBe(false);
  });

  it('rejects missing provider', () => {
    const s = billSchema.safeParse({ ...validBill, provider: '' });
    expect(s.success).toBe(false);
  });

  it('rejects provider exceeding max length', () => {
    const s = billSchema.safeParse({ ...validBill, provider: 'A'.repeat(101) });
    expect(s.success).toBe(false);
  });

  it('rejects invalid PIN length', () => {
    const s = billSchema.safeParse({ ...validBill, pin: '12' });
    expect(s.success).toBe(false);
  });

  it('accepts optional accountNumber', () => {
    const s = billSchema.safeParse({ ...validBill, accountNumber: '1234567890' });
    expect(s.success).toBe(true);
  });

  it('rejects overly long accountNumber', () => {
    const s = billSchema.safeParse({ ...validBill, accountNumber: 'A'.repeat(51) });
    expect(s.success).toBe(false);
  });
});