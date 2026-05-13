import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const updateTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  createdAt: z.string().datetime({ message: "Invalid date/time format" }),
  direction: z.enum(["CREDIT", "DEBIT"], { message: "Direction must be CREDIT or DEBIT" }),
});

describe('updateTransactionSchema', () => {
  const validTx = {
    transactionId: 'txn123',
    amount: '150',
    createdAt: '2026-05-13T00:00:00Z',
    direction: 'CREDIT',
  };

  it('accepts valid transaction update', () => {
    expect(updateTransactionSchema.safeParse(validTx).success).toBe(true);
  });

  it('rejects missing transactionId', () => {
    const s = updateTransactionSchema.safeParse({ ...validTx, transactionId: '' });
    expect(s.success).toBe(false);
  });

  it('rejects invalid datetime', () => {
    const s = updateTransactionSchema.safeParse({ ...validTx, createdAt: 'not-a-date' });
    expect(s.success).toBe(false);
  });

  it('rejects invalid direction', () => {
    const s = updateTransactionSchema.safeParse({ ...validTx, direction: 'UP' });
    expect(s.success).toBe(false);
  });

  it('rejects overly long description', () => {
    const s = updateTransactionSchema.safeParse({ ...validTx, description: 'A'.repeat(201) });
    expect(s.success).toBe(false);
  });

  it('accepts optional description', () => {
    const s = updateTransactionSchema.safeParse({ ...validTx, description: 'Adjusted manually' });
    expect(s.success).toBe(true);
  });
});