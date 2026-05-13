import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const transferSchema = z.object({
  sourceAccountId: z.string().min(1, "Source account required"),
  amount: z.coerce.number().min(0.01, "Minimum transfer is 0.01"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  accountName: z.string().min(1, "Name is required").max(100),
  accountNumber: z.string().min(6, "Invalid Account Number").max(30),
  bankName: z.string().min(1, "Bank Name is required").max(100),
  routingNumber: z.string().max(30).optional(),
  note: z.string().max(200).optional(),
  saveBeneficiary: z.string().optional(),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

describe('transferSchema', () => {
  const validTransfer = {
    sourceAccountId: 'src123',
    amount: '100',
    pin: '1234',
    accountName: 'John Doe',
    accountNumber: '123456789',
    bankName: 'Global Bank',
  };

  it('accepts valid transfer', () => {
    expect(transferSchema.safeParse(validTransfer).success).toBe(true);
  });

  it('rejects zero amount', () => {
    const s = transferSchema.safeParse({ ...validTransfer, amount: '0' });
    expect(s.success).toBe(false);
  });

  it('rejects short PIN', () => {
    const s = transferSchema.safeParse({ ...validTransfer, pin: '12' });
    expect(s.success).toBe(false);
  });

  it('rejects missing sourceAccountId', () => {
    const s = transferSchema.safeParse({ ...validTransfer, sourceAccountId: '' });
    expect(s.success).toBe(false);
  });

  it('rejects long accountName', () => {
    const s = transferSchema.safeParse({ ...validTransfer, accountName: 'A'.repeat(101) });
    expect(s.success).toBe(false);
  });

  it('rejects short accountNumber', () => {
    const s = transferSchema.safeParse({ ...validTransfer, accountNumber: '12345' });
    expect(s.success).toBe(false);
  });

  it('rejects overly long note', () => {
    const s = transferSchema.safeParse({ ...validTransfer, note: 'A'.repeat(201) });
    expect(s.success).toBe(false);
  });
});