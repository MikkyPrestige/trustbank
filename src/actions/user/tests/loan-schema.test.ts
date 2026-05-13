import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const loanApplicationSchema = z.object({
  amount: z.coerce.number().min(500, "Minimum loan amount is $500"),
  months: z.coerce.number().int().min(1, "Please select a term"),
  reason: z.string().max(200).optional(),
  pin: z.string().length(4, "PIN must be 4 digits"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

describe('loanApplicationSchema', () => {
  const validLoan = {
    amount: '5000',
    months: '12',
    reason: 'Home renovation',
    pin: '1234',
  };

  it('accepts valid loan application', () => {
    expect(loanApplicationSchema.safeParse(validLoan).success).toBe(true);
  });

  it('rejects amount below minimum', () => {
    const s = loanApplicationSchema.safeParse({ ...validLoan, amount: '300' });
    expect(s.success).toBe(false);
  });

  it('rejects non-integer months', () => {
    const s = loanApplicationSchema.safeParse({ ...validLoan, months: '12.5' });
    expect(s.success).toBe(false);
  });

  it('rejects zero months', () => {
    const s = loanApplicationSchema.safeParse({ ...validLoan, months: '0' });
    expect(s.success).toBe(false);
  });

  it('rejects reason exceeding max length', () => {
    const s = loanApplicationSchema.safeParse({ ...validLoan, reason: 'A'.repeat(201) });
    expect(s.success).toBe(false);
  });

  it('rejects invalid PIN', () => {
    const s = loanApplicationSchema.safeParse({ ...validLoan, pin: '12' });
    expect(s.success).toBe(false);
  });
});