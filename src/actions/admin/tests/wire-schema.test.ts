import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const wireSchema = z.object({
  accountId: z.string().min(1, "Account Selection is required"),
  amount: z.coerce.number().min(50, "Minimum wire amount is $50 equivalent"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  bankName: z.string().min(3, "Bank Name is required").max(100),
  accountName: z.string().min(3, "Account Name is required").max(100),
  accountNumber: z.string().min(6, "Invalid Account Number").max(30),
  country: z.string().min(2, "Country is required").max(100),
  swiftCode: z.string().max(30).optional(),
  saveBeneficiary: z.string().optional(),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

describe('wireSchema', () => {
  const validWire = {
    accountId: '123',
    amount: '500',
    pin: '1234',
    bankName: 'Global Bank',
    accountName: 'John Doe',
    accountNumber: '123456789',
    country: 'US',
  };

  it('accepts valid wire data', () => {
    expect(wireSchema.safeParse(validWire).success).toBe(true);
  });

  it('rejects amount below minimum', () => {
    const s = wireSchema.safeParse({ ...validWire, amount: '10' });
    expect(s.success).toBe(false);
  });

  it('rejects missing accountId', () => {
    const s = wireSchema.safeParse({ ...validWire, accountId: '' });
    expect(s.success).toBe(false);
  });

  it('rejects short bank name', () => {
    const s = wireSchema.safeParse({ ...validWire, bankName: 'AB' });
    expect(s.success).toBe(false);
  });

  it('rejects invalid PIN', () => {
    const s = wireSchema.safeParse({ ...validWire, pin: '12' });
    expect(s.success).toBe(false);
  });

  it('rejects swiftCode exceeding max', () => {
    const s = wireSchema.safeParse({ ...validWire, swiftCode: 'A'.repeat(31) });
    expect(s.success).toBe(false);
  });
});